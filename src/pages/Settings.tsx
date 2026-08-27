import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Card, GhostButton, PrimaryButton, SectionTitle } from "../components/Card";
import { LeafAccent } from "../components/Illustrations";
import { SYNCED_KEYS, useCheckIns, useSettings } from "../lib/storage";
import { computeStreak } from "../lib/badges";
import { PROVIDERS } from "../lib/ai";
import {
  getCurrentUser,
  onAuthStateChange,
  pullAllFromCloud,
  pushAllToCloud,
  pushKeyToCloud,
  signIn,
  signOut,
  signUp,
  SUPABASE_SCHEMA_SQL,
} from "../lib/supabase";
import type { AIProvider } from "../types";

function CloudSyncCard({
  settings,
  update,
}: {
  settings: ReturnType<typeof useSettings>["settings"];
  update: ReturnType<typeof useSettings>["update"];
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const configured = Boolean(settings.cloudSync.url && settings.cloudSync.anonKey);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    let unsubscribe = () => {};
    getCurrentUser(settings).then((u) => {
      if (!cancelled) setUser(u);
    });
    // onAuthStateChange resolves only once the (lazily loaded) client is
    // ready - if the effect is already torn down by then, unsubscribe
    // immediately instead of leaking the subscription.
    onAuthStateChange(settings, (u) => setUser(u)).then((unsub) => {
      if (cancelled) unsub();
      else unsubscribe = unsub;
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
    // Only re-run when the Supabase project config itself changes - not on
    // every unrelated settings edit (e.g. typing in the nickname field).
  }, [configured, settings.cloudSync.url, settings.cloudSync.anonKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // If the project config is cleared, fall back to "logged out" for display
  // purposes without needing a synchronous setState from inside an effect.
  const displayUser = configured ? user : null;

  useEffect(() => {
    if (!displayUser) return;
    const handler = (e: Event) => {
      const key = (e as CustomEvent<{ key?: string }>).detail?.key;
      if (key && SYNCED_KEYS.includes(key)) pushKeyToCloud(settings, key).catch(() => {});
    };
    window.addEventListener("ms-storage", handler);
    return () => window.removeEventListener("ms-storage", handler);
  }, [displayUser, settings]);

  async function handleSignUp() {
    setAuthError("");
    setAuthBusy(true);
    try {
      await signUp(settings, authEmail, authPassword);
      setSyncMessage("註冊成功！請檢查信箱完成驗證後登入。");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "發生錯誤，請稍後再試");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignIn() {
    setAuthError("");
    setAuthBusy(true);
    try {
      await signIn(settings, authEmail, authPassword);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "發生錯誤，請稍後再試");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handlePush() {
    setSyncMessage("");
    setSyncBusy(true);
    try {
      await pushAllToCloud(settings);
      setSyncMessage("已上傳到雲端");
    } catch (e) {
      setSyncMessage(e instanceof Error ? `上傳失敗：${e.message}` : "上傳失敗");
    } finally {
      setSyncBusy(false);
    }
  }

  async function handlePull() {
    setSyncMessage("");
    setSyncBusy(true);
    try {
      await pullAllFromCloud(settings);
      setSyncMessage("已從雲端還原");
    } catch (e) {
      setSyncMessage(e instanceof Error ? `還原失敗：${e.message}` : "還原失敗");
    } finally {
      setSyncBusy(false);
    }
  }

  return (
    <Card className="space-y-4">
      <SectionTitle
        title="☁️ 雲端同步"
        subtitle="登入後，紀錄會自動備份到你自己的 Supabase 專案，換裝置也不遺失"
      />

      <details className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 list-none">
          <span className="text-violet-500">🛠️</span>
          還沒設定？點我看設定步驟
          <span className="ml-auto text-slate-400 transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 space-y-2">
          <p>1. 到 supabase.com 免費註冊，建立一個新專案。</p>
          <p>2. 專案建立後，到左側選單「SQL Editor」，貼上並執行以下指令建立資料表：</p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 text-slate-100 p-2 text-[11px] whitespace-pre-wrap">
            {SUPABASE_SCHEMA_SQL}
          </pre>
          <p>3. 到左側選單「Project Settings → API」，複製 Project URL 與 anon public key，填到下方欄位。</p>
          <p>4. 註冊一個帳號（Email + 密碼）並登入即可自動同步；換裝置時登入同一帳號後按「從雲端還原」。</p>
        </div>
      </details>

      <div className="space-y-2">
        <input
          value={settings.cloudSync.url}
          onChange={(e) =>
            update({ cloudSync: { ...settings.cloudSync, url: e.target.value } })
          }
          placeholder="Supabase Project URL"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm font-mono"
        />
        <input
          value={settings.cloudSync.anonKey}
          onChange={(e) =>
            update({ cloudSync: { ...settings.cloudSync, anonKey: e.target.value } })
          }
          placeholder="Supabase anon public key"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm font-mono"
        />
      </div>

      {!configured ? (
        <p className="text-xs text-slate-400">請先完成上方設定步驟，才能註冊/登入雲端同步。</p>
      ) : displayUser ? (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            已登入：{displayUser.email}
          </p>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton onClick={handlePush} disabled={syncBusy}>
              {syncBusy ? "同步中..." : "立即上傳"}
            </PrimaryButton>
            <GhostButton onClick={handlePull}>從雲端還原</GhostButton>
            <GhostButton onClick={() => signOut(settings).catch(() => {})}>登出</GhostButton>
          </div>
          {syncMessage && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{syncMessage}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
          />
          <input
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            placeholder="密碼（至少 6 碼）"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
          />
          <div className="flex gap-2">
            <PrimaryButton
              onClick={handleSignIn}
              disabled={authBusy || !authEmail || !authPassword}
            >
              登入
            </PrimaryButton>
            <GhostButton onClick={handleSignUp}>註冊新帳號</GhostButton>
          </div>
          {authError && <p className="text-xs text-red-500">{authError}</p>}
          {syncMessage && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{syncMessage}</p>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400">
        你的 AI API Key 不會被同步，只會留在這台裝置上。同步的資料會透過你自己 Supabase 專案的
        Row Level Security 保護，只有你登入的帳號能讀取。
      </p>
    </Card>
  );
}

export default function Settings() {
  const { settings, update } = useSettings();
  const { items: checkIns } = useCheckIns();
  const [showKey, setShowKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const streak = computeStreak(checkIns);
  const activeProvider = PROVIDERS.find((p) => p.id === settings.provider)!;

  function clearAllData() {
    localStorage.clear();
    window.location.reload();
  }

  function setProvider(id: AIProvider) {
    update({ provider: id });
  }

  function setApiKey(value: string) {
    update({ apiKeys: { ...settings.apiKeys, [settings.provider]: value } });
  }

  function setModel(value: string) {
    update({ models: { ...settings.models, [settings.provider]: value } });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          我的 <LeafAccent className="w-6 h-4" />
        </h1>
      </header>

      <Card className="flex items-center gap-4">
        <span className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-3xl">
          🙂
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">
            {settings.name || "訪客"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🔥 連續打卡 {streak} 天
          </p>
        </div>
      </Card>

      <Card className="space-y-4">
        <SectionTitle title="暱稱" subtitle="用來在首頁跟你打招呼（選填）" />
        <input
          value={settings.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="你的名字"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
        />
      </Card>

      <Card className="space-y-4">
        <SectionTitle
          title="版本模式"
          subtitle="簡化版無須 API，進化版 Pro 串接你自己的 AI API Key"
        />
        <div className="flex gap-2">
          <GhostButton active={settings.mode === "lite"} onClick={() => update({ mode: "lite" })}>
            簡化版 Lite
          </GhostButton>
          <GhostButton active={settings.mode === "pro"} onClick={() => update({ mode: "pro" })}>
            👑 進化版 Pro
          </GhostButton>
        </div>
      </Card>

      {settings.mode === "pro" && (
        <Card className="space-y-4">
          <SectionTitle title="AI 服務商" subtitle="選擇要串接的 AI API，並輸入你自己的 Key" />
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <GhostButton
                key={p.id}
                active={settings.provider === p.id}
                onClick={() => setProvider(p.id)}
              >
                {p.label}
              </GhostButton>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={settings.apiKeys[settings.provider]}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={activeProvider.keyPlaceholder}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm font-mono"
            />
            <GhostButton onClick={() => setShowKey((s) => !s)}>
              {showKey ? "隱藏" : "顯示"}
            </GhostButton>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            你的 API Key 只會儲存在這台裝置的瀏覽器 localStorage 中，App 沒有後端伺服器，Key
            不會被上傳或分享給任何第三方；但也代表清除瀏覽器資料會需要重新輸入。App
            會直接從你的瀏覽器呼叫 {activeProvider.label} API，費用依你自己的 API 用量計算。
          </p>
          {activeProvider.keyHint && (
            <p className="text-xs text-amber-600 dark:text-amber-400">{activeProvider.keyHint}</p>
          )}

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              AI 模型
            </label>
            <select
              value={settings.models[settings.provider]}
              onChange={(e) => setModel(e.target.value)}
              className="w-full mt-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
            >
              {activeProvider.models.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      <CloudSyncCard settings={settings} update={update} />

      <Card className="space-y-3">
        <SectionTitle title="資料管理" subtitle="未設定雲端同步時，所有紀錄都只存在這台裝置上" />
        {!confirmClear ? (
          <GhostButton onClick={() => setConfirmClear(true)} className="text-red-500 border-red-300">
            清除所有本機資料
          </GhostButton>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-500">
              確定要清除所有打卡紀錄、訓練紀錄與設定嗎？此操作無法復原。
            </p>
            <div className="flex gap-2">
              <PrimaryButton onClick={clearAllData} className="bg-red-600 hover:bg-red-500">
                確定清除
              </PrimaryButton>
              <GhostButton onClick={() => setConfirmClear(false)}>取消</GhostButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
