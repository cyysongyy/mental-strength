import { Link } from "react-router-dom";
import { Card, SectionTitle } from "../components/Card";
import ModeBadge from "../components/ModeBadge";
import { ModuleCard } from "../components/ModuleCard";
import { LeafAccent } from "../components/Illustrations";
import { useModuleLogs, useSettings } from "../lib/storage";
import { MODULE_META, type ModuleId } from "../types";

export default function Modules() {
  const { settings } = useSettings();
  const { items: logs } = useModuleLogs();

  const counts: Record<string, number> = {};
  for (const log of logs) counts[log.type] = (counts[log.type] ?? 0) + 1;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          練習 <LeafAccent className="w-6 h-4" />
        </h1>
        <ModeBadge mode={settings.mode} />
      </header>

      <div className="space-y-3">
        {(Object.keys(MODULE_META) as ModuleId[]).map((id) => (
          <ModuleCard key={id} id={id} count={counts[id] ?? 0} />
        ))}
      </div>

      <Card>
        <SectionTitle
          title={settings.mode === "pro" ? "進化版 Pro 已啟用" : "想要更客製化的鍛鍊？"}
          subtitle={
            settings.mode === "pro"
              ? "所有模組將使用 AI 提供深度、客製化的引導與分析。"
              : "升級進化版，串接你的 AI API Key，獲得蘇格拉底式對話教練、AI 語意拆解與個人化週報。"
          }
        />
        {settings.mode !== "pro" && (
          <Link
            to="/settings"
            className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium"
          >
            前往設定升級 →
          </Link>
        )}
      </Card>
    </div>
  );
}
