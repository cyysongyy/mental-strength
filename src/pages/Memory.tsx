import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, GhostButton, PrimaryButton, SectionTitle } from "../components/Card";
import { LeafAccent } from "../components/Illustrations";
import { useModuleLogs } from "../lib/storage";
import { buildMemories, searchMemories } from "../lib/memory";
import { THEME_META, buildEventThreads, themeStats, type ThemeId } from "../lib/events";
import { MODULE_META } from "../types";

function daysBetween(a: number, b: number) {
  return Math.round(Math.abs(a - b) / 86400000);
}

export default function Memory() {
  const { items: logs } = useModuleLogs();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<ThemeId | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const memories = useMemo(() => buildMemories(logs), [logs]);
  const allThreads = useMemo(() => buildEventThreads(memories), [memories]);
  const stats = useMemo(() => themeStats(allThreads), [allThreads]);

  const threads = useMemo(() => {
    const matchedIds = query.trim()
      ? new Set(searchMemories(query, memories).map((m) => m.id))
      : null;
    return allThreads.filter((t) => {
      if (theme !== "all" && t.theme !== theme) return false;
      if (matchedIds) return t.occurrences.some((o) => matchedIds.has(o.id));
      return true;
    });
  }, [allThreads, memories, query, theme]);

  // Starting a session pre-filled from a past event is the whole point: a
  // recurring problem shouldn't have to be typed out again from scratch.
  function trainOn(title: string) {
    // A reframe entry's problem is "situation — automatic thought"; only the
    // situation belongs in the trigger box, and the thought is asked for
    // separately on the next step.
    navigate("/modules/reframe", { state: { trigger: title.split(" — ")[0] } });
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          🧠 訓練資料庫 <LeafAccent className="w-6 h-4" />
        </h1>
      </header>

      {allThreads.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            還沒有資料。完成任何一次練習後，App
            會自動把它整理成「事件」：同一件事再次發生時會自動歸到同一條線上，讓你看見它出現幾次、你用過哪些方法、哪一次真的有效。
          </p>
        </Card>
      ) : (
        <>
          <Card className="space-y-3">
            <SectionTitle
              title={`${allThreads.length} 個事件 ・ ${memories.length} 次訓練`}
              subtitle="相似的困擾會自動歸成同一個事件，不需要你分類或命名"
            />
            <div className="space-y-2">
              {stats.map((s) => {
                const meta = THEME_META[s.theme];
                const max = Math.max(...stats.map((x) => x.sessionCount));
                return (
                  <div key={s.theme}>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span
                        className={`w-5 h-5 shrink-0 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-[10px]`}
                      >
                        {meta.icon}
                      </span>
                      <span className="flex-1 text-slate-600 dark:text-slate-300">{meta.name}</span>
                      <span className="text-slate-400">{s.eventCount} 事件</span>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {s.sessionCount} 次
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${meta.color}`}
                        style={{ width: `${(s.sessionCount / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋事件，例如「主管」「簡報」"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <GhostButton active={theme === "all"} onClick={() => setTheme("all")}>
                全部
              </GhostButton>
              {stats.map((s) => (
                <GhostButton
                  key={s.theme}
                  active={theme === s.theme}
                  onClick={() => setTheme(s.theme)}
                >
                  {THEME_META[s.theme].icon} {THEME_META[s.theme].name}
                </GhostButton>
              ))}
            </div>
          </Card>

          {threads.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">找不到符合的事件。</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {threads.map((t) => {
                const meta = THEME_META[t.theme];
                const isOpen = expanded === t.id;
                const repeated = t.occurrences.length > 1;
                return (
                  <Card key={t.id} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-6 h-6 shrink-0 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-xs`}
                      >
                        {meta.icon}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{meta.name}</span>
                      {repeated && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          重複 {t.occurrences.length} 次
                        </span>
                      )}
                      <span className="ml-auto text-slate-400">
                        {new Date(t.lastAt).toLocaleDateString("zh-TW")}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {t.title}
                    </p>

                    {repeated && (
                      <p className="text-xs text-slate-400">
                        第一次到最近一次相隔 {daysBetween(t.firstAt, t.lastAt)} 天 ・ 用過{" "}
                        {t.modules.map((m) => MODULE_META[m].name).join("、")}
                      </p>
                    )}

                    <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 p-3 border border-violet-200 dark:border-violet-500/30">
                      <p className="text-[11px] text-violet-500 font-medium mb-0.5">
                        最近一次有效的做法
                      </p>
                      <p className="text-sm text-slate-800 dark:text-violet-100">
                        {t.latestAnswer}
                      </p>
                    </div>

                    {t.latestPlan && (
                      <p className="text-xs text-sky-600 dark:text-sky-300">
                        若-則計畫：{t.latestPlan}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <PrimaryButton onClick={() => trainOn(t.title)}>
                        用這個事件再練一次
                      </PrimaryButton>
                      {repeated && (
                        <GhostButton onClick={() => setExpanded(isOpen ? null : t.id)}>
                          {isOpen ? "收合歷程" : "看完整歷程"}
                        </GhostButton>
                      )}
                    </div>

                    {isOpen && (
                      <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                        {t.occurrences.map((o) => (
                          <div key={o.id} className="pt-2">
                            <p className="text-[11px] text-slate-400">
                              {MODULE_META[o.type].icon} {MODULE_META[o.type].name} ・{" "}
                              {new Date(o.timestamp).toLocaleDateString("zh-TW")}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {o.problem}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">
                              → {o.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
