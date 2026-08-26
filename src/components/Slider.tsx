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
}: SliderProps) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
        <span className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
          {value}
        </span>
      </div>
      {hint && <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{hint}</p>}
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
