import { useMemo } from "react";
import type { ModuleLogEntry } from "../types";
import { buildMemories } from "../lib/memory";
import { buildEventThreads } from "../lib/events";
import { THEME_META } from "../lib/events";

/**
 * A short free-text field for "what is this about", with recent events
 * offered as one-tap chips.
 *
 * The point of naming the event is that a record with no subject cannot join
 * an event thread or be found by search later - it becomes a row that says
 * only "you did a thing". The chips exist so that saying which recurring
 * problem this is costs a tap rather than retyping it for the fifth time.
 */
export function EventPicker({
  value,
  onChange,
  logs,
  label,
  placeholder,
  limit = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  logs: ModuleLogEntry[];
  label: string;
  placeholder: string;
  limit?: number;
}) {
  const recent = useMemo(
    () =>
      buildEventThreads(buildMemories(logs))
        .sort((a, b) => b.lastAt - a.lastAt)
        .slice(0, limit),
    [logs, limit],
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
      {recent.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recent.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(value === t.title ? "" : t.title)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors max-w-full ${
                value === t.title
                  ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="block truncate">
                {THEME_META[t.theme].icon} {t.title}
              </span>
            </button>
          ))}
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
      />
    </div>
  );
}
