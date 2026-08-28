import { MODULE_META } from "../types";
import type { ScoredMemory } from "../lib/memory";

/**
 * Surfaces past problems that resemble what the user is typing now, with the
 * answer that worked last time available in one tap - the whole point being
 * that recurring difficulties shouldn't require retyping the same reflection
 * from scratch every time.
 */
export function MemoryHints({
  matches,
  onUseAnswer,
  useLabel = "沿用這個答案",
}: {
  matches: ScoredMemory[];
  onUseAnswer?: (answer: string) => void;
  useLabel?: string;
}) {
  if (matches.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 space-y-3">
      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
        🧠 你以前遇過類似的事
      </p>
      {matches.map(({ memory }) => (
        <div key={memory.id} className="space-y-1.5">
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
            {MODULE_META[memory.type].icon} {MODULE_META[memory.type].name} ・{" "}
            {new Date(memory.timestamp).toLocaleDateString("zh-TW")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {memory.problem}
          </p>
          <p className="text-sm text-slate-800 dark:text-slate-100">{memory.answer}</p>
          {memory.plan && (
            <p className="text-xs text-sky-600 dark:text-sky-300">計畫：{memory.plan}</p>
          )}
          {onUseAnswer && (
            <button
              type="button"
              onClick={() => onUseAnswer(memory.answer)}
              className="text-xs font-medium text-violet-600 dark:text-violet-300 underline underline-offset-2"
            >
              {useLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
