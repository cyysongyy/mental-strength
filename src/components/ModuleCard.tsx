import { Link } from "react-router-dom";
import { MODULE_META, MODULE_ROUTES, type ModuleId } from "../types";
import {
  BrainIllustration,
  PinwheelIllustration,
  PotionIllustration,
  TargetIllustration,
} from "./Illustrations";

const ILLUSTRATIONS: Record<ModuleId, React.ComponentType<{ className?: string }>> = {
  reframe: BrainIllustration,
  circles: TargetIllustration,
  tolerance: PotionIllustration,
  sos: PinwheelIllustration,
};

function ChevronBadge() {
  return (
    <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 6 L15 12 L9 18" />
      </svg>
    </span>
  );
}

export function ModuleCard({
  id,
  count,
  compact = false,
}: {
  id: ModuleId;
  count?: number;
  compact?: boolean;
}) {
  const meta = MODULE_META[id];
  const Illustration = ILLUSTRATIONS[id];

  if (compact) {
    return (
      <Link
        to={MODULE_ROUTES[id]}
        className="relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow p-3"
      >
        <div className="w-14 h-14 mb-1.5">
          <Illustration className="w-full h-full" />
        </div>
        <p className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
          {meta.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5 line-clamp-2">
          {meta.short}
        </p>
        <span className="absolute top-3 right-3 text-slate-300 dark:text-slate-600">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6 L15 12 L9 18" />
          </svg>
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={MODULE_ROUTES[id]}
      className="flex items-center rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-20 h-20 shrink-0 p-2">
        <Illustration className="w-full h-full" />
      </div>
      <div className="flex-1 flex items-center justify-between py-2 pr-3 pl-1 min-w-0">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">{meta.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{meta.short}</p>
        </div>
        {count !== undefined ? (
          <div className="text-right shrink-0 pl-2">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
            <p className="text-[10px] text-slate-400">次</p>
          </div>
        ) : (
          <ChevronBadge />
        )}
      </div>
    </Link>
  );
}
