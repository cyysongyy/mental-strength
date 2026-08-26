import { useState } from "react";
import { Card, PrimaryButton, SectionTitle } from "../components/Card";
import ModeBadge, { NeedsApiKeyNotice } from "../components/ModeBadge";
import {
  isWithinLastDays,
  uid,
  useCheckIns,
  useModuleLogs,
  useSettings,
  useWeeklyReports,
} from "../lib/storage";
import { BADGES, computeStreak, computeUnlockedBadges } from "../lib/badges";
import { generateWeeklyReport } from "../lib/claude";
import { renderLiteMarkdown } from "../lib/markdown";
import { MODULE_META, type ModuleId } from "../types";

function LiteReport() {
  const { items: checkIns } = useCheckIns();
  const { items: logs } = useModuleLogs();
  const streak = computeStreak(checkIns);
  const unlocked = computeUnlockedBadges(checkIns, logs);

  const counts: Record<string, number> = {};
  for (const log of logs) counts[log.type] = (counts[log.type] ?? 0) + 1;
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div className="space-y-5">
      <Card className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-orange-500">{streak}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">連續打卡天數</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-violet-500">{checkIns.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">累計快測次數</p>
        </div>
      </Card>

      <Card>
        <SectionTitle title="各模組使用次數" />
        <div className="space-y-3">
          {(Object.keys(MODULE_META) as ModuleId[]).map((id) => (
            <div key={id}>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {MODULE_META[id].icon} {MODULE_META[id].name}
                </span>
                <span className="font-semibold">{counts[id] ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${MODULE_META[id].color}`}
                  style={{ width: `${((counts[id] ?? 0) / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="成就徽章" subtitle={`已解鎖 ${unlocked.length} / ${BADGES.length}`} />
        <div className="grid grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const isUnlocked = unlocked.includes(b.id);
            return (
              <div
                key={b.id}
                title={b.description}
                className={`flex flex-col items-center text-center gap-1 p-2 rounded-xl ${
                  isUnlocked
                    ? "bg-violet-50 dark:bg-violet-500/10"
                    : "opacity-30 grayscale"
                }`}
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="text-[11px] leading-tight text-slate-600 dark:text-slate-300">
                  {b.name}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function summarizeLogsForAI(logs: ReturnType<typeof useModuleLogs>["items"]) {
  const recent = logs.filter((l) => isWithinLastDays(l.timestamp, 7));
  return JSON.stringify(
    recent.map((l) => {
      const base = { type: l.type, time: new Date(l.timestamp).toISOString() };
      if (l.type === "reframe")
        return {
          ...base,
          trigger: l.trigger,
          thought: l.automaticThought,
          distortions: l.distortions,
          aiDialogue: l.aiDialogue?.map((d) => d.text),
        };
      if (l.type === "circles")
        return { ...base, itemsCount: l.items.length, aiBreakdown: l.aiBreakdown };
      if (l.type === "tolerance")
        return { ...base, fear: l.fear, completed: l.completed, aiPlan: l.aiPlan };
      return { ...base, context: l.context };
    }),
  );
}

function ProReport() {
  const { settings } = useSettings();
  const { items: logs } = useModuleLogs();
  const { items: reports, add } = useWeeklyReports();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recentCount = logs.filter((l) => isWithinLastDays(l.timestamp, 7)).length;
  const latest = [...reports].sort((a, b) => b.timestamp - a.timestamp)[0];

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const content = await generateWeeklyReport(
        settings.apiKey,
        settings.model,
        summarizeLogsForAI(logs),
      );
      add({
        id: uid(),
        timestamp: Date.now(),
        weekLabel: new Date().toLocaleDateString("zh-TW"),
        content,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  if (!settings.apiKey) return <NeedsApiKeyNotice />;

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <SectionTitle
          title="AI 心理肌肉週報 (MMI Report)"
          subtitle={`過去 7 天有 ${recentCount} 筆訓練紀錄`}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <PrimaryButton onClick={generate} disabled={loading || recentCount === 0} className="w-full">
          {loading ? "AI 分析中..." : "產生本週報告"}
        </PrimaryButton>
        {recentCount === 0 && (
          <p className="text-xs text-slate-400">先完成一些訓練模組，才有資料可以分析喔。</p>
        )}
      </Card>

      {latest && <Card>{renderLiteMarkdown(latest.content)}</Card>}

      {reports.length > 1 && (
        <Card>
          <SectionTitle title="歷史週報" />
          <div className="space-y-2">
            {[...reports]
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(1)
              .map((r) => (
                <details key={r.id} className="text-sm">
                  <summary className="cursor-pointer text-slate-500 dark:text-slate-400">
                    {r.weekLabel}
                  </summary>
                  <div className="pt-2">{renderLiteMarkdown(r.content)}</div>
                </details>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function Report() {
  const { settings } = useSettings();

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">📊 訓練反饋與週報</h1>
        <ModeBadge mode={settings.mode} />
      </header>
      {settings.mode === "pro" ? <ProReport /> : <LiteReport />}
    </div>
  );
}
