import { Link } from "react-router-dom";
import type { AppMode } from "../types";

export default function ModeBadge({ mode }: { mode: AppMode }) {
  if (mode === "pro") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
        ✨ Pro · AI 驅動
      </span>
    );
  }
  return (
    <Link
      to="/settings"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
    >
      簡化版 · 升級 Pro →
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
      輸入你的 Anthropic API Key 才能使用 AI 功能。
    </div>
  );
}
