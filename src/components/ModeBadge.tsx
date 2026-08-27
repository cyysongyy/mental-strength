import { Link } from "react-router-dom";
import type { AppMode } from "../types";

export default function ModeBadge({ mode }: { mode: AppMode }) {
  if (mode === "pro") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm">
        👑 進化版 Pro
      </span>
    );
  }
  return (
    <Link
      to="/settings"
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-slate-800/80 text-violet-600 dark:text-violet-300 shadow-sm border border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-slate-700"
    >
      👑 進化版・升級 Pro →
    </Link>
  );
}

export function NeedsApiKeyNotice() {
  return (
    <div className="rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 p-4 text-sm text-amber-800 dark:text-amber-300">
      Pro 模式已開啟，但尚未設定 API Key。請前往
      <Link to="/settings" className="underline font-medium mx-1">
        設定
      </Link>
      輸入你的 API Key 才能使用 AI 功能。
    </div>
  );
}
