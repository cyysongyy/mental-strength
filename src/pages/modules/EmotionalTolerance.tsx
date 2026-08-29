import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, GhostButton, PrimaryButton, SectionTitle } from "../../components/Card";
import ModeBadge, { NeedsApiKeyNotice } from "../../components/ModeBadge";
import { TheoryNote } from "../../components/TheoryNote";
import { ImplementationIntention } from "../../components/ImplementationIntention";
import { formatImplementationIntention } from "../../lib/implementationIntention";
import { uid, useDraft, useModuleLogs, useSettings } from "../../lib/storage";
import { hasActiveApiKey, planMicroExposure } from "../../lib/ai";
import { DraftResume } from "../../components/DraftResume";
import { EventPicker } from "../../components/EventPicker";
import { MODULE_META } from "../../types";

const CHECKLIST = [
  "留意身體的不適感，但不逃離",
  "深呼吸 3 次，肩膀放鬆",
  "對自己說「這種感覺會過去」",
  "撐過計時器結束，不提前中斷",
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface ToleranceDraft {
  duration: 180 | 300;
  remaining: number;
  checked: boolean[];
  fear: string;
  ifSituation: string;
  thenAction: string;
}

function LiteTolerance({ onDone }: { onDone: () => void }) {
  const { items: logs, add } = useModuleLogs();
  const [duration, setDuration] = useState<180 | 300>(180);
  const [remaining, setRemaining] = useState(180);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));
  const [fear, setFear] = useState("");
  const [ifSituation, setIfSituation] = useState("");
  const [thenAction, setThenAction] = useState("");
  const intervalRef = useRef<number | null>(null);
  const { draft, save: saveDraft, clear: clearDraft, dismiss: dismissDraft } =
    useDraft<ToleranceDraft>("tolerance");
  const [resumed, setResumed] = useState(false);

  const elapsed = duration - remaining;

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            window.clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  // Persist the attempt as it happens. The timer is deliberately not
  // restarted on resume - it comes back paused, so returning to the app does
  // not silently run time down while the person reads the screen.
  useEffect(() => {
    if (elapsed === 0 && !fear.trim()) return;
    saveDraft({ duration, remaining, checked, fear, ifSituation, thenAction });
  }, [duration, remaining, elapsed, checked, fear, ifSituation, thenAction, saveDraft]);

  function resumeDraft() {
    if (!draft) return;
    const d = draft.data;
    setDuration(d.duration);
    setRemaining(d.remaining);
    setChecked(d.checked);
    setFear(d.fear);
    setIfSituation(d.ifSituation);
    setThenAction(d.thenAction);
    setFinished(d.remaining === 0);
    setResumed(true);
    dismissDraft();
  }

  function selectDuration(d: 180 | 300) {
    setDuration(d);
    setRemaining(d);
    setFinished(false);
  }

  function handleSubmit() {
    add({
      type: "tolerance",
      id: uid(),
      timestamp: Date.now(),
      fear,
      // Seconds actually endured, not the length that was picked - stopping
      // at 1:20 of a 5-minute challenge is a 1:20 record, not a 5-minute one.
      durationSec: elapsed,
      completed: finished,
      mode: "lite",
      implementationIntention: formatImplementationIntention(ifSituation, thenAction),
    });
    clearDraft();
    onDone();
  }

  const progress = 1 - remaining / duration;

  return (
    <Card className="space-y-5">
      {draft && !resumed && (
        <DraftResume
          updatedAt={draft.updatedAt}
          preview={
            draft.data.fear ||
            `${formatTime(draft.data.duration - draft.data.remaining)} / ${formatTime(draft.data.duration)}`
          }
          onResume={resumeDraft}
          onDiscard={clearDraft}
        />
      )}
      <SectionTitle
        title="計時微挑戰"
        subtitle="選一個時間長度，帶著不適感專注完成"
      />
      <TheoryNote framework="辯證行為治療 DBT・痛苦耐受">
        源自 Marsha Linehan 發展的辯證行為治療（DBT）中的「痛苦耐受技巧」（Distress Tolerance）：與其逃避或壓抑不舒服的感覺，練習「帶著它」撐過一小段時間，能讓大腦逐漸學會不適感是可以承受、會自然消退的，長期能提升情緒耐受度與衝動控制力。
      </TheoryNote>
      <EventPicker
        value={fear}
        onChange={setFear}
        logs={logs}
        label="這次面對的是什麼？（選填）"
        placeholder="例如：明天要跟主管報告"
      />

      <div className="flex gap-2">
        <GhostButton active={duration === 180} onClick={() => selectDuration(180)}>
          3 分鐘
        </GhostButton>
        <GhostButton active={duration === 300} onClick={() => selectDuration(300)}>
          5 分鐘
        </GhostButton>
      </div>

      <div className="flex flex-col items-center py-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-200 dark:text-slate-800"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - progress)}
              strokeLinecap="round"
              className="text-amber-500 transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatTime(remaining)}
          </div>
        </div>
        {!finished && (
          <PrimaryButton onClick={() => setRunning((r) => !r)} className="mt-4">
            {running ? "暫停" : remaining === duration ? "開始" : "繼續"}
          </PrimaryButton>
        )}
      </div>

      <div className="space-y-2">
        {CHECKLIST.map((item, i) => (
          <label key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() =>
                setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)))
              }
              className="accent-amber-500"
            />
            {item}
          </label>
        ))}
      </div>

      {elapsed > 0 && (
        <>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 text-sm text-amber-700 dark:text-amber-300">
            {finished
              ? `做得好！你剛剛帶著不適感撐過了 ${formatTime(duration)}，這正是情緒耐受力被訓練的時刻。`
              : `你已經撐了 ${formatTime(elapsed)}。想繼續就按繼續；現在停下也可以打卡——撐不完不是失敗，「撐到哪裡會想停」本身就是值得記下來的資料。`}
          </div>
          <ImplementationIntention
            situation={ifSituation}
            action={thenAction}
            onSituationChange={setIfSituation}
            onActionChange={setThenAction}
            situationPlaceholder="下次感到類似的不適感時"
            actionPlaceholder="先深呼吸，撐過 3 分鐘"
          />
        </>
      )}

      {/* Savable from the moment anything has been endured. Requiring the
          timer to run out meant an abandoned challenge left no trace at all -
          yet where someone stops is often the more informative number. */}
      <PrimaryButton onClick={handleSubmit} disabled={elapsed === 0} className="w-full">
        {finished ? "完成打卡" : elapsed > 0 ? "先記錄到這裡" : "完成打卡"}
      </PrimaryButton>
    </Card>
  );
}

function ProTolerance({ onDone }: { onDone: () => void }) {
  const { settings } = useSettings();
  const { add } = useModuleLogs();
  const [fear, setFear] = useState("");
  // Only the typed description needs keeping: the generated plan is written
  // to the log the moment it comes back, so it is already safe.
  const { draft, save: saveDraft, clear: clearDraft, dismiss: dismissDraft } =
    useDraft<{ fear: string }>("tolerance-pro");
  const [resumed, setResumed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<{ step: number; title: string; description: string }[] | null>(
    null,
  );

  useEffect(() => {
    if (!fear.trim() || plan) return;
    saveDraft({ fear });
  }, [fear, plan, saveDraft]);

  async function submit() {
    if (!fear.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const p = await planMicroExposure(settings, fear);
      setPlan(p);
      clearDraft();
      add({
        type: "tolerance",
        id: uid(),
        timestamp: Date.now(),
        fear,
        durationSec: 0,
        completed: false,
        mode: "pro",
        aiPlan: p,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  if (!hasActiveApiKey(settings)) return <NeedsApiKeyNotice />;

  return (
    <Card className="space-y-4">
      <SectionTitle
        title="AI 階梯式自願不適計畫"
        subtitle="描述一個你想克服的害怕情境，AI 會規劃 5 階的微型暴露任務"
      />
      {draft && !resumed && (
        <DraftResume
          updatedAt={draft.updatedAt}
          preview={draft.data.fear}
          onResume={() => {
            setFear(draft.data.fear);
            setResumed(true);
            dismissDraft();
          }}
          onDiscard={clearDraft}
        />
      )}
      <textarea
        value={fear}
        onChange={(e) => setFear(e.target.value)}
        rows={3}
        placeholder="例如：我很害怕在會議上公開發言"
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <PrimaryButton onClick={submit} disabled={loading || !fear.trim()} className="w-full">
        {loading ? "規劃中..." : "生成挑戰階梯"}
      </PrimaryButton>

      {plan && (
        <div className="space-y-2 pt-2">
          {plan.map((s) => (
            <div
              key={s.step}
              className="flex gap-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3"
            >
              <div className="w-7 h-7 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                {s.step}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{s.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
          <PrimaryButton onClick={onDone} className="w-full mt-2">
            完成
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

export default function EmotionalTolerance() {
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {MODULE_META.tolerance.icon} {MODULE_META.tolerance.name}
        </h1>
        <ModeBadge mode={settings.mode} />
      </header>
      {settings.mode === "pro" ? (
        <ProTolerance onDone={() => navigate("/modules")} />
      ) : (
        <LiteTolerance onDone={() => navigate("/modules")} />
      )}
    </div>
  );
}
