import { useMemo, useState } from "react";
import { Card, GhostButton, SectionTitle } from "../components/Card";
import { LeafAccent } from "../components/Illustrations";
import { useCheckIns, useModuleLogs, useToughnessEntries } from "../lib/storage";
import { RECORD_KIND_LABELS, buildRecords, type RecordKind } from "../lib/records";

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Records() {
  const { items: logs } = useModuleLogs();
  const { items: checkIns } = useCheckIns();
  const { items: toughness } = useToughnessEntries();
  const [kind, setKind] = useState<RecordKind | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const all = useMemo(
    () => buildRecords(logs, checkIns, toughness),
    [logs, checkIns, toughness],
  );

  const records = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      if (!q) return true;
      const haystack = [r.summary, ...r.details.map((d) => `${d.label} ${d.value}`)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [all, kind, query]);

  const counts = useMemo(() => {
    const map = new Map<RecordKind, number>();
    for (const r of all) map.set(r.kind, (map.get(r.kind) ?? 0) + 1);
    return map;
  }, [all]);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          🗂️ 完整紀錄 <LeafAccent className="w-6 h-4" />
        </h1>
      </header>

      <Card className="space-y-3">
        <SectionTitle
          title={`共 ${all.length} 筆紀錄`}
          subtitle="你儲存過的每一筆都在這裡，逐筆依時間排列，點開可以看到當時填的所有欄位"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋任一欄位的內容"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {RECORD_KIND_LABELS.filter(
            (k) => k.id === "all" || (counts.get(k.id as RecordKind) ?? 0) > 0,
          ).map((k) => (
            <GhostButton
              key={k.id}
              active={kind === k.id}
              onClick={() => setKind(k.id as RecordKind | "all")}
            >
              {k.icon} {k.label}
              {k.id !== "all" && ` ${counts.get(k.id as RecordKind) ?? 0}`}
            </GhostButton>
          ))}
        </div>
      </Card>

      {records.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {all.length === 0
              ? "還沒有任何紀錄。完成任何一次練習或快測後就會出現在這裡。"
              : "沒有符合條件的紀錄。"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {records.map((r) => {
            const isOpen = openId === r.id;
            return (
              <Card key={r.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : r.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span>{r.icon}</span>
                    <span className="text-slate-500 dark:text-slate-400">{r.kindLabel}</span>
                    {r.mode === "pro" && (
                      <span className="px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 text-[10px]">
                        Pro
                      </span>
                    )}
                    <span className="ml-auto text-slate-400 tabular-nums">
                      {formatDateTime(r.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-100 line-clamp-2">
                    {r.summary}
                  </p>
                  <p className="text-[11px] text-violet-500 dark:text-violet-300 mt-1">
                    {isOpen ? "收合" : "展開完整內容"}
                  </p>
                </button>

                {isOpen && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {r.details.map((d, i) => (
                      <div key={i}>
                        <p className="text-[11px] text-slate-400 mb-0.5">{d.label}</p>
                        <p
                          className={`text-sm whitespace-pre-wrap ${
                            d.emphasis
                              ? "rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 p-2.5 text-slate-800 dark:text-violet-100"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {d.value}
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
    </div>
  );
}
