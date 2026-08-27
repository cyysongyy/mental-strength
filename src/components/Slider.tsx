import type { ReactNode } from "react";

interface SliderProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  accent?: string;
  icon?: ReactNode;
  iconBg?: string;
  decoration?: ReactNode;
}

export default function Slider({
  label,
  hint,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
  accent = "accent-violet-500",
  icon,
  iconBg = "bg-violet-100 text-violet-500 dark:bg-violet-500/20 dark:text-violet-300",
  decoration,
}: SliderProps) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-1 gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${iconBg}`}>
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <span className="font-medium text-slate-900 dark:text-slate-100 block">{label}</span>
            {hint && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{hint}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          {decoration}
          <span className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
            {value}
            <span className="text-sm text-slate-400 font-normal">/{max}</span>
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-full cursor-pointer ${accent}`}
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
