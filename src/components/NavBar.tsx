import { NavLink } from "react-router-dom";

function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11 L12 3 L21 11" />
      <path d="M5 10 V21 H19 V10" />
      <path d="M10 21 V14 H14 V21" />
    </svg>
  );
}

function RecordsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8 H15" />
      <path d="M9 12 H15" />
      <path d="M9 16 H13" />
    </svg>
  );
}

function PracticeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20 C7 16 3 12.5 3 8.6 C3 5.9 5.1 4 7.6 4 C9.1 4 10.5 4.8 12 6.3 C13.5 4.8 14.9 4 16.4 4 C18.9 4 21 5.9 21 8.6 C21 12.5 17 16 12 20 Z" />
    </svg>
  );
}

function MeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20 C4 16 7.5 14 12 14 C16.5 14 20 16 20 20" />
    </svg>
  );
}

const TABS = [
  { to: "/", label: "首頁", Icon: HomeIcon },
  { to: "/report", label: "紀錄", Icon: RecordsIcon },
  { to: "/modules", label: "練習", Icon: PracticeIcon },
  { to: "/settings", label: "我的", Icon: MeIcon },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
      <div className="max-w-lg mx-auto grid grid-cols-4">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <Icon className="w-6 h-6" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
