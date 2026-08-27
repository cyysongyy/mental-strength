import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, PrimaryButton, SectionTitle } from "../components/Card";
import ModeBadge, { NeedsApiKeyNotice } from "../components/ModeBadge";
import { LeafAccent } from "../components/Illustrations";
import {
  isWithinLastDays,
  uid,
  useCheckIns,
  useModuleLogs,
  useSettings,
  useToughnessEntries,
  useWeeklyReports,
} from "../lib/storage";
import { BADGES, computeStreak, computeUnlockedBadges } from "../lib/badges";
import { generateWeeklyReport, hasActiveApiKey } from "../lib/ai";
import { renderLiteMarkdown } from "../lib/markdown";
import {
  TOUGHNESS_DIMENSIONS,
  TOUGHNESS_DIMENSION_META,
  overallToughness,
} from "../lib/toughness";
import { MODULE_META, type ModuleId, type ToughnessEntry } from "../types";

function ToughnessCard({ entries }: { entries: ToughnessEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            心理韌性測驗 4Cs
          </h2>
          <LeafAccent className="w-6 h-4" />
        </div>
        {latest && (
          <span className="text-xs text-slate-400">
            {new Date(latest.timestamp).toLocaleDateString("zh-TW")}
          </span>
        )}
      </div>

      {!latest ? (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            還沒做過測驗。花 3 分鐘完成 12 題，掌握你在挑戰、承諾、控制、信心四個面向的自我覺察。
          </p>
          <Link to="/toughness">
            <PrimaryButton className="w-full">開始測驗</PrimaryButton>
          </Link>
        </>
      ) : (
        <>
          <div className="space-y-2.5">
            {TOUGHNESS_DIMENSIONS.map((dim) => {
              const meta = TOUGHNESS_DIMENSION_META[dim];
              const score = latest.scores[dim];
              const delta = previous ? score - previous.scores[dim] : 0;
              return (
                <div key={dim}>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span
                      className={`w-5 h-5 shrink-0 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-[10px]`}
                    >
                      {meta.icon}
                    </span>
                    <span className="flex-1 text-slate-600 dark:text-slate-300">{meta.name}</span>
                    {previous && Math.abs(delta) >= 0.05 && (
                      <span className={delta > 0 ? "text-emerald-500" : "text-rose-500"}>
                        {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
                      </span>
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      {score.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-1.5 rounded-full bg-gradient-to-r ${meta.color}`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">
            綜合韌性分數 {overallToughness(latest).toFixed(1)} / 5.0 ・已測驗 {sorted.length} 次
          </p>
          <Link to="/toughness">
            <PrimaryButton className="w-full">重新測驗</PrimaryButton>
          </Link>
        </>
      )}
    </Card>
  );
}

function LiteReport() {
  const { items: checkIns } = useCheckIns();
  const { items: logs } = useModuleLogs();
  const { items: toughnessEntries } = useToughnessEntries();
  const streak = computeStreak(checkIns);
  const unlocked = computeUnlockedBadges(checkIns, logs);

  const counts: Record<string, number> = {};
  for (const log of logs) counts[log.type] = (counts[log.type] ?? 0) + 1;
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div className="space-y-5">
      <Card className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center text-center gap-1.5">
          <span className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-2xl">
            🔥
          </span>
          <p className="text-3xl font-bold text-orange-500">{streak}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">連續打卡天數</p>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5">
          <span className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-2xl">
            ⏱️
          </span>
          <p className="text-3xl font-bold text-violet-500">{checkIns.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">累計快測次數</p>
        </div>
      </Card>

      <ToughnessCard entries={toughnessEntries} />

      <Card>
        <div className="flex items-center gap-1.5 mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">各模組使用次數</h2>
          <LeafAccent className="w-6 h-4" />
        </div>
        <div className="space-y-4">
          {(Object.keys(MODULE_META) as ModuleId[]).map((id) => (
            <div key={id}>
              <div className="flex items-center gap-2 text-sm mb-1.5">
                <span
                  className={`w-7 h-7 shrink-0 rounded-full bg-gradient-to-br ${MODULE_META[id].color} flex items-center justify-center text-sm`}
                >
                  {MODULE_META[id].icon}
                </span>
                <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">
                  {MODULE_META[id].name}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {counts[id] ?? 0}
                </span>
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
                className={`flex flex-col items-center text-center gap-1 p-2 rounded-xl border ${
                  isUnlocked
                    ? "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30"
                    : "border-transparent opacity-30 grayscale"
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

function summarizeLogsForAI(
  logs: ReturnType<typeof useModuleLogs>["items"],
  toughnessEntries: ToughnessEntry[],
) {
  const recent = logs.filter((l) => isWithinLastDays(l.timestamp, 7));
  const sortedToughness = [...toughnessEntries].sort((a, b) => a.timestamp - b.timestamp);
  const latestToughness = sortedToughness[sortedToughness.length - 1];
  const previousToughness = sortedToughness[sortedToughness.length - 2];

  return JSON.stringify({
    logs: recent.map((l) => {
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
    toughnessScores: latestToughness
      ? {
          latest: latestToughness.scores,
          previous: previousToughness?.scores ?? null,
        }
      : null,
  });
}

function ProReport() {
  const { settings } = useSettings();
  const { items: logs } = useModuleLogs();
  const { items: toughnessEntries } = useToughnessEntries();
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
        settings,
        summarizeLogsForAI(logs, toughnessEntries),
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

  if (!hasActiveApiKey(settings)) return <NeedsApiKeyNotice />;

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
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          📊 紀錄 <LeafAccent className="w-6 h-4" />
        </h1>
        <ModeBadge mode={settings.mode} />
      </header>
      {settings.mode === "pro" ? <ProReport /> : <LiteReport />}
    </div>
  );
}
