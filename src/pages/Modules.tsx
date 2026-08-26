import { Link } from "react-router-dom";
import { Card, SectionTitle } from "../components/Card";
import ModeBadge from "../components/ModeBadge";
import { useModuleLogs, useSettings } from "../lib/storage";
import { MODULE_META, type ModuleId } from "../types";

const ROUTES: Record<ModuleId, string> = {
  reframe: "/modules/reframe",
  circles: "/modules/circles",
  tolerance: "/modules/tolerance",
  sos: "/sos",
};

export default function Modules() {
  const { settings } = useSettings();
  const { items: logs } = useModuleLogs();

  const counts: Record<string, number> = {};
  for (const log of logs) counts[log.type] = (counts[log.type] ?? 0) + 1;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">訓練模組</h1>
        <ModeBadge mode={settings.mode} />
      </header>

      <div className="space-y-3">
        {(Object.keys(MODULE_META) as ModuleId[]).map((id) => (
          <Link key={id} to={ROUTES[id]}>
            <Card className="flex items-center gap-4 hover:border-violet-400 transition-colors">
              <div
                className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${MODULE_META[id].color} flex items-center justify-center text-2xl`}
              >
                {MODULE_META[id].icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {MODULE_META[id].name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {MODULE_META[id].short}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {counts[id] ?? 0}
                </p>
                <p className="text-xs text-slate-400">次</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <SectionTitle
          title={settings.mode === "pro" ? "Pro 模式已啟用" : "想要更客製化的鍛鍊？"}
          subtitle={
            settings.mode === "pro"
              ? "所有模組將使用 AI 提供深度、客製化的引導與分析。"
              : "升級 Pro 模式，串接你的 AI API Key，獲得蘇格拉底式對話教練、AI 語意拆解與個人化週報。"
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
