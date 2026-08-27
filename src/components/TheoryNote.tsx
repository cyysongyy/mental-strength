export function TheoryNote({
  framework,
  children,
}: {
  framework: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3">
      <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 list-none">
        <span className="text-violet-500">📖</span>
        為什麼有效？
        <span className="text-xs text-slate-400 font-normal">（{framework}）</span>
        <span className="ml-auto text-slate-400 transition-transform group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
        {children}
      </p>
    </details>
  );
}
