import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "首頁", icon: "🏠" },
  { to: "/modules", label: "訓練", icon: "💪" },
  { to: "/sos", label: "SOS", icon: "🫁" },
  { to: "/report", label: "週報", icon: "📊" },
  { to: "/settings", label: "設定", icon: "⚙️" },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
      <div className="max-w-lg mx-auto grid grid-cols-5">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
