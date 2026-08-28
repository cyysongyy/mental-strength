import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../components/Slider";
import { Card, PrimaryButton, SectionTitle } from "../components/Card";
import ModeBadge from "../components/ModeBadge";
import { ModuleCard } from "../components/ModuleCard";
import {
  HeroLandscape,
  HeartCloudIcon,
  SproutIcon,
  LeafAccent,
  MountainBadgeIcon,
  CompassBadgeIcon,
} from "../components/Illustrations";
import {
  todayStr,
  uid,
  useCheckIns,
  useModuleLogs,
  useSettings,
} from "../lib/storage";
import { MODULE_META, MODULE_ROUTES, type ModuleId } from "../types";
import { computeStreak, computeUnlockedBadges, BADGES } from "../lib/badges";

function recommendModule(stress: number, control: number): ModuleId {
  if (stress >= 8) return "sos";
  if (control <= 3) return "circles";
  if (stress >= 6 && control >= 5) return "tolerance";
  return "reframe";
}

/**
 * Searching past entries was reachable only after navigating into a records
 * page, which is the wrong shape for "what did I write about this before?" -
 * a question people have at the moment they open the app, not after two taps.
 */
function RecordSearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  function submit() {
    const query = q.trim();
    if (!query) return;
    navigate("/records", { state: { query } });
  }

  return (
    <div className="flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="🔍 搜尋過去的紀錄，例如「主管」「簡報」"
        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 p-2.5 text-sm"
      />
      <PrimaryButton onClick={submit} disabled={!q.trim()}>
        搜尋
      </PrimaryButton>
    </div>
  );
}

export default function Home() {
  const { settings } = useSettings();
  const { items: checkIns, add: addCheckIn } = useCheckIns();
  const { items: logs } = useModuleLogs();
  const navigate = useNavigate();

  const today = todayStr();
  const todaysCheckIn = useMemo(
    () => [...checkIns].reverse().find((c) => c.date === today),
    [checkIns, today],
  );

  const [stress, setStress] = useState(5);
  const [control, setControl] = useState(5);
  const [redoing, setRedoing] = useState(false);

  const streak = computeStreak(checkIns);
  const unlocked = computeUnlockedBadges(checkIns, logs);
  const latestBadge = BADGES.find((b) => unlocked.includes(b.id));

  const showForm = !todaysCheckIn || redoing;
  const activeResult = redoing ? null : todaysCheckIn;

  function handleSubmit() {
    const recommended = recommendModule(stress, control);
    addCheckIn({
      id: uid(),
      date: today,
      timestamp: Date.now(),
      stress,
      control,
      recommended,
    });
    setRedoing(false);
  }

  function goToModule(id: ModuleId) {
    navigate(MODULE_ROUTES[id]);
  }

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString("zh-TW", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            心理肌肉鍛鍊{settings.name ? `，${settings.name}` : ""}
            <LeafAccent className="w-7 h-5" />
          </h1>
          <p className="font-script text-xl text-violet-500 dark:text-violet-300 -mt-1 whitespace-nowrap">
            Stronger Mind, Better You.
          </p>
        </div>
        <ModeBadge mode={settings.mode} />
      </header>

      <div className="rounded-3xl overflow-hidden shadow-sm h-32">
        <HeroLandscape className="w-full h-full" />
      </div>

      <RecordSearchBar />

      {streak > 0 && (
        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-medium">
          🔥 連續打卡 {streak} 天
          {latestBadge && (
            <span className="ml-auto text-slate-500 dark:text-slate-400 font-normal">
              最新成就：{latestBadge.icon} {latestBadge.name}
            </span>
          )}
        </div>
      )}

      {showForm ? (
        <Card className="space-y-6">
          <SectionTitle
            title="每日 3 分鐘心境快測"
            subtitle="誠實面對此刻的感受，沒有標準答案。"
          />
          <Slider
            label="壓力值"
            hint="此刻你感受到的壓力有多大？"
            value={stress}
            onChange={setStress}
            lowLabel="很平靜"
            highLabel="快撐不住"
            icon={<MountainBadgeIcon className="w-5 h-5" />}
            iconBg="bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-300"
            decoration={<HeartCloudIcon className="w-11 h-7" />}
          />
          <Slider
            label="掌控感"
            hint="你覺得自己對目前局面的掌控程度？"
            value={control}
            onChange={setControl}
            lowLabel="完全失控"
            highLabel="完全掌控"
            icon={<CompassBadgeIcon className="w-5 h-5" />}
            iconBg="bg-lime-100 text-lime-600 dark:bg-lime-500/20 dark:text-lime-300"
            decoration={<SproutIcon className="w-11 h-7" />}
          />
          <PrimaryButton onClick={handleSubmit} className="w-full flex items-center justify-center gap-2">
            <span>✨ 完成快測</span>
            <span>→</span>
          </PrimaryButton>
        </Card>
      ) : activeResult ? (
        <Card className="space-y-4">
          <SectionTitle title="今日快測結果" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">壓力值</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeResult.stress}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">掌控感</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeResult.control}
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 bg-gradient-to-br ${MODULE_META[activeResult.recommended].color} text-white`}
          >
            <p className="text-xs uppercase tracking-wide opacity-80">今日推薦訓練</p>
            <p className="text-xl font-bold mt-1">
              {MODULE_META[activeResult.recommended].icon}{" "}
              {MODULE_META[activeResult.recommended].name}
            </p>
            <p className="text-sm opacity-90 mt-1">
              {MODULE_META[activeResult.recommended].short}
            </p>
            <button
              onClick={() => goToModule(activeResult.recommended)}
              className="mt-3 w-full bg-white/20 hover:bg-white/30 rounded-xl py-2 font-medium transition-colors"
            >
              開始訓練 →
            </button>
          </div>

          <button
            onClick={() => setRedoing(true)}
            className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-violet-500"
          >
            重新快測
          </button>
        </Card>
      ) : null}

      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">四大訓練模組</h2>
          <LeafAccent className="w-6 h-4" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          也可以隨時自由選擇想練習的模組
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(MODULE_META) as ModuleId[]).map((id) => (
            <ModuleCard key={id} id={id} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
