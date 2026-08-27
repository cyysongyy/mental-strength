import { useState } from "react";
import { Card, GhostButton, PrimaryButton, SectionTitle } from "../components/Card";
import { LeafAccent } from "../components/Illustrations";
import { useCheckIns, useSettings } from "../lib/storage";
import { computeStreak } from "../lib/badges";
import { PROVIDERS } from "../lib/ai";
import type { AIProvider } from "../types";

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

      <Card className="space-y-3">
        <SectionTitle title="資料管理" subtitle="所有紀錄都只存在這台裝置上" />
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
