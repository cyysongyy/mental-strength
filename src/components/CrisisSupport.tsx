import { useState } from "react";
import { CRISIS_RESOURCES, NOT_MEDICAL_DISCLAIMER } from "../lib/safety";

/**
 * Shown when someone's own words suggest they may be in danger. Deliberately
 * warm rather than alarming, and dismissible - the goal is to put a real
 * phone number within one tap, not to interrupt or lecture.
 */
export function CrisisSupport({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 p-4 space-y-3">
      <p className="font-semibold text-rose-700 dark:text-rose-200">
        看起來你現在真的很不好受
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
        這種時候不需要一個人硬撐。下面都是台灣 24
        小時有人接聽的專線，打過去可以只是說說話，不用準備好要講什麼。
      </p>

      <div className="grid grid-cols-2 gap-2">
        {CRISIS_RESOURCES.map((r) => (
          <a
            key={r.number}
            href={`tel:${r.number}`}
            className="rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 p-3 text-center"
          >
            <p className="text-xl font-bold text-rose-600 dark:text-rose-300 tabular-nums">
              {r.number}
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{r.note}</p>
          </a>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {NOT_MEDICAL_DISCLAIMER}
      </p>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-slate-400 underline underline-offset-2"
        >
          我現在還好，收起這則訊息
        </button>
      )}
    </div>
  );
}

/**
 * Always-available entry point, so help is reachable on purpose and not only
 * when the app happens to detect something in what was typed.
 */
export function CrisisLink() {
  const [open, setOpen] = useState(false);

  if (open) return <CrisisSupport onDismiss={() => setOpen(false)} />;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="w-full rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300 text-center"
    >
      ☎️ 需要立即找人談談？看緊急支援專線
    </button>
  );
}
