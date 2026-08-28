/**
 * Offered when a module is opened with an unfinished session saved. Resuming
 * has to be a choice rather than automatic: someone returning to reframe a
 * brand new problem should not silently inherit last week's half-finished one.
 */
export function DraftResume({
  updatedAt,
  preview,
  onResume,
  onDiscard,
}: {
  updatedAt: number;
  preview: string;
  onResume: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 space-y-2">
      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
        📝 你有一筆沒完成的紀錄
      </p>
      <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
        {new Date(updatedAt).toLocaleString("zh-TW", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      {preview && (
        <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{preview}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onResume}
          className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium"
        >
          接續填寫
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300"
        >
          重新開始
        </button>
      </div>
    </div>
  );
}
