import { useMemo, useState } from "react";
import { Card, GhostButton, SectionTitle } from "../components/Card";
import { LeafAccent } from "../components/Illustrations";
import { useModuleLogs } from "../lib/storage";
import { buildMemories, searchMemories } from "../lib/memory";
import { MODULE_META, type ModuleId } from "../types";

const FILTERS: { id: ModuleId | "all"; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "reframe", label: MODULE_META.reframe.name },
  { id: "circles", label: MODULE_META.circles.name },
  { id: "tolerance", label: MODULE_META.tolerance.name },
  { id: "sos", label: MODULE_META.sos.name },
];

export default function Memory() {
  const { items: logs } = useModuleLogs();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ModuleId | "all">("all");
  const [copied, setCopied] = useState("");

  const memories = useMemo(() => buildMemories(logs), [logs]);
  const results = useMemo(() => {
    const byType = filter === "all" ? memories : memories.filter((m) => m.type === filter);
    return searchMemories(query, byType);
  }, [memories, filter, query]);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      // Clipboard can be unavailable (permissions, insecure context) - the
      // text is on screen either way, so this is not worth an error state.
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          🧠 記憶庫 <LeafAccent className="w-6 h-4" />
        </h1>
      </header>

      <Card className="space-y-3">
        <SectionTitle
          title="你的問題與解答"
          subtitle="每次練習完成後會自動存進這裡，遇到類似狀況時 App 會主動提醒你上次怎麼做的"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋你遇過的問題，例如「簡報」「主管」"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <GhostButton key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </GhostButton>
          ))}
        </div>
      </Card>

      {memories.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            還沒有紀錄。完成任何一個練習模組後，你的問題與當時有效的解法就會自動累積在這裡，成為下次的參考。
          </p>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            找不到符合「{query}」的紀錄。
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((m) => (
            <Card key={m.id} className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-6 h-6 shrink-0 rounded-full bg-gradient-to-br ${MODULE_META[m.type].color} flex items-center justify-center text-xs`}
                >
                  {MODULE_META[m.type].icon}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {MODULE_META[m.type].name}
                </span>
                <span className="ml-auto text-slate-400">
                  {new Date(m.timestamp).toLocaleDateString("zh-TW")}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">當時的困擾</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{m.problem}</p>
              </div>
              <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 p-3 border border-violet-200 dark:border-violet-500/30">
                <p className="text-[11px] text-violet-500 font-medium mb-0.5">當時有效的做法</p>
                <p className="text-sm text-slate-800 dark:text-violet-100">{m.answer}</p>
              </div>
              {m.plan && (
                <p className="text-xs text-sky-600 dark:text-sky-300">若-則計畫：{m.plan}</p>
              )}
              <button
                type="button"
                onClick={() => copy(m.answer, m.id)}
                className="text-xs text-slate-400 hover:text-violet-500 underline underline-offset-2"
              >
                {copied === m.id ? "已複製" : "複製這個解法"}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
