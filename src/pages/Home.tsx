import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../components/Slider";
import { Card, PrimaryButton, SectionTitle } from "../components/Card";
import ModeBadge from "../components/ModeBadge";
import {
  todayStr,
  uid,
  useCheckIns,
  useModuleLogs,
  useSettings,
} from "../lib/storage";
import { MODULE_META, type ModuleId } from "../types";
import { computeStreak, computeUnlockedBadges, BADGES } from "../lib/badges";

function recommendModule(stress: number, control: number): ModuleId {
  if (stress >= 8) return "sos";
  if (control <= 3) return "circles";
  if (stress >= 6 && control >= 5) return "tolerance";
  return "reframe";
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
    navigate(id === "sos" ? "/sos" : `/modules/${id}`);
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString("zh-TW", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            心理肌肉鍛鍊{settings.name ? `，${settings.name}` : ""}
          </h1>
        </div>
        <ModeBadge mode={settings.mode} />
      </header>

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
          />
          <Slider
            label="掌控感"
            hint="你覺得自己對目前局面的掌控程度？"
            value={control}
            onChange={setControl}
            lowLabel="完全失控"
            highLabel="完全掌控"
          />
          <PrimaryButton onClick={handleSubmit} className="w-full">
            完成快測
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

      <Card>
        <SectionTitle title="四大訓練模組" subtitle="也可以隨時自由選擇想練習的模組" />
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(MODULE_META) as ModuleId[]).map((id) => (
            <button
              key={id}
              onClick={() => goToModule(id)}
              className={`rounded-xl p-3 text-left bg-gradient-to-br ${MODULE_META[id].color} text-white`}
            >
              <div className="text-2xl">{MODULE_META[id].icon}</div>
              <div className="font-semibold mt-1">{MODULE_META[id].name}</div>
              <div className="text-xs opacity-85 mt-0.5">{MODULE_META[id].short}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
