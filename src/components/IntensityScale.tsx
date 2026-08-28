const FACES = ["😌", "🙂", "😐", "😕", "😟", "😣"];

function faceFor(value: number) {
  return FACES[Math.min(FACES.length - 1, Math.floor(value / 2))];
}

/**
 * A 0-10 distress rating (SUDS). One drag, no typing - the whole point is
 * that measuring whether a practice helped must cost almost nothing, or it
 * won't get filled in and the training data stays unmeasurable.
 */
export function IntensityScale({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        <span className="ml-auto text-lg">{faceFor(value)}</span>
        <span className="text-lg font-bold text-violet-600 dark:text-violet-300 tabular-nums w-6 text-right">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-600"
      />
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>0 完全平靜</span>
        <span>10 非常強烈</span>
      </div>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

/** Before → after summary shown once a practice is finished. */
export function IntensityDelta({ before, after }: { before: number; after: number }) {
  const drop = before - after;
  const improved = drop > 0;
  return (
    <div
      className={`rounded-xl p-3 border ${
        improved
          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"
          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
      }`}
    >
      <p className="text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">情緒強度變化</p>
      <p className="text-slate-800 dark:text-slate-100">
        <span className="text-lg font-bold tabular-nums">{before}</span>
        <span className="mx-2 text-slate-400">→</span>
        <span className="text-lg font-bold tabular-nums">{after}</span>
        {improved ? (
          <span className="ml-3 text-sm text-emerald-600 dark:text-emerald-400">
            下降 {drop} 分
          </span>
        ) : drop === 0 ? (
          <span className="ml-3 text-sm text-slate-500">持平</span>
        ) : (
          <span className="ml-3 text-sm text-amber-600 dark:text-amber-400">上升 {-drop} 分</span>
        )}
      </p>
      {!improved && (
        <p className="text-[11px] text-slate-400 mt-1">
          沒有下降也是有用的資訊：代表這個方法對這件事可能不合適，下次可以換一種試試。
        </p>
      )}
    </div>
  );
}
