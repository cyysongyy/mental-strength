import { useState } from "react";
import { Card, GhostButton, PrimaryButton, SectionTitle } from "../components/Card";
import { useSettings } from "../lib/storage";
import { AVAILABLE_MODELS } from "../lib/claude";

export default function Settings() {
  const { settings, update } = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  function clearAllData() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">⚙️ 設定</h1>
      </header>

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
          subtitle="簡化版無須 API，Pro 版串接你自己的 AI API Key"
        />
        <div className="flex gap-2">
          <GhostButton active={settings.mode === "lite"} onClick={() => update({ mode: "lite" })}>
            簡化版 Lite
          </GhostButton>
          <GhostButton active={settings.mode === "pro"} onClick={() => update({ mode: "pro" })}>
            ✨ 精緻版 Pro
          </GhostButton>
        </div>
      </Card>

      {settings.mode === "pro" && (
        <Card className="space-y-4">
          <SectionTitle title="Anthropic API Key" subtitle="用於串接 Claude 提供 AI 深度鍛鍊功能" />
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              placeholder="sk-ant-..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm font-mono"
            />
            <GhostButton onClick={() => setShowKey((s) => !s)}>
              {showKey ? "隱藏" : "顯示"}
            </GhostButton>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            你的 API Key 只會儲存在這台裝置的瀏覽器 localStorage 中，App 沒有後端伺服器，Key
            不會被上傳或分享給任何第三方；但也代表清除瀏覽器資料會需要重新輸入。App
            會直接從你的瀏覽器呼叫 Anthropic API，費用依你自己的 API 用量計算。
          </p>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              AI 模型
            </label>
            <select
              value={settings.model}
              onChange={(e) => update({ model: e.target.value })}
              className="w-full mt-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
            >
              {AVAILABLE_MODELS.map((m) => (
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
