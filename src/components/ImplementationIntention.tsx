interface ImplementationIntentionProps {
  situationPlaceholder: string;
  actionPlaceholder: string;
  situation: string;
  action: string;
  onSituationChange: (v: string) => void;
  onActionChange: (v: string) => void;
}

export function ImplementationIntention({
  situationPlaceholder,
  actionPlaceholder,
  situation,
  action,
  onSituationChange,
  onActionChange,
}: ImplementationIntentionProps) {
  return (
    <div className="rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-3 space-y-2">
      <p className="text-xs font-medium text-sky-600 dark:text-sky-300">
        🎯 若-則計畫（選填）——研究顯示預先設定「觸發情境→行動」能大幅提高之後真的做到的機率
      </p>
      <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200 flex-wrap">
        <span className="font-medium">如果</span>
        <input
          value={situation}
          onChange={(e) => onSituationChange(e.target.value)}
          placeholder={situationPlaceholder}
          className="flex-1 min-w-[140px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200 flex-wrap">
        <span className="font-medium">我就</span>
        <input
          value={action}
          onChange={(e) => onActionChange(e.target.value)}
          placeholder={actionPlaceholder}
          className="flex-1 min-w-[140px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
        />
      </div>
    </div>
  );
}

