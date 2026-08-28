import { useEffect, useState } from "react";
import { Card, PrimaryButton, SectionTitle } from "../components/Card";
import ModeBadge, { NeedsApiKeyNotice } from "../components/ModeBadge";
import { TheoryNote } from "../components/TheoryNote";
import { CrisisLink, CrisisSupport } from "../components/CrisisSupport";
import { detectsCrisis } from "../lib/safety";
import { uid, useModuleLogs, useSettings } from "../lib/storage";
import { generateGroundingScript, hasActiveApiKey } from "../lib/ai";

const PHASES = [
  { label: "吸氣", color: "text-sky-500" },
  { label: "屏息", color: "text-violet-500" },
  { label: "吐氣", color: "text-emerald-500" },
  { label: "屏息", color: "text-violet-500" },
];

const PRESET_SCRIPTS: Record<string, string> = {
  焦慮:
    "找一個舒服的姿勢坐下。感覺你的腳踏在地上，很穩。慢慢吸氣，數到四；停留一下；再慢慢吐氣，數到四。告訴自己：我現在是安全的，這種感覺會過去。我不需要立刻解決所有問題，我只需要陪自己度過這一分鐘。",
  憤怒:
    "先給自己一點空間，離開讓你生氣的情境幾步。深呼吸，感受空氣進入身體再離開。憤怒是一種訊號，提醒你有某個界線被觸碰了——你可以晚一點再決定怎麼回應，現在先讓身體冷靜下來。",
  恐慌:
    "把注意力帶回身體。說出你現在看到的三樣東西、聽到的兩個聲音、感覺到的一種觸感。你的身體正在經歷強烈的反應，但這不代表有危險發生。跟著呼吸，一次次把自己帶回當下。",
};

function BoxBreathing() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 4000);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <div
          className="absolute w-28 h-28 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500"
          style={{
            animation: running ? "boxBreath 16s ease-in-out infinite" : "none",
            transform: running ? undefined : "scale(0.55)",
          }}
        />
        <div className={`relative text-xl font-bold ${running ? PHASES[phase].color : "text-slate-400"} bg-white/70 dark:bg-slate-900/70 rounded-full px-4 py-2`}>
          {running ? PHASES[phase].label : "準備好了嗎？"}
        </div>
      </div>
      <PrimaryButton onClick={() => setRunning((r) => !r)} className="mt-4">
        {running ? "停止" : "開始箱式呼吸 (4-4-4-4)"}
      </PrimaryButton>
    </div>
  );
}

function LiteSOS() {
  const { add } = useModuleLogs();
  const [selected, setSelected] = useState<string | null>(null);

  function logUsage(context: string) {
    add({
      type: "sos",
      id: uid(),
      timestamp: Date.now(),
      context,
      technique: "box-breathing",
      mode: "lite",
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle title="箱式呼吸" subtitle="4 秒吸氣、4 秒屏息、4 秒吐氣、4 秒屏息" />
        <TheoryNote framework="多重迷走神經理論 Polyvagal Theory">
          刻意放慢、延長吐氣的呼吸方式，會刺激迷走神經，啟動副交感神經系統（讓身體「煞車」的系統），直接降低心跳與皮質醇濃度。這是少數能在
          90 秒內用生理方式主動關掉「戰或逃」反應的科學實證方法，美軍與運動員也常用類似技巧快速鎮定。
        </TheoryNote>
        <BoxBreathing />
      </Card>

      <Card className="space-y-3">
        <SectionTitle title="心理學家語音引導（逐字稿）" subtitle="選擇最貼近你現在狀態的引導" />
        <div className="flex gap-2">
          {Object.keys(PRESET_SCRIPTS).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelected(key);
                logUsage(key);
              }}
              className={`px-4 py-2 rounded-xl border text-sm font-medium ${
                selected === key
                  ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        {selected && (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 bg-sky-50 dark:bg-sky-500/10 rounded-xl p-4 border border-sky-200 dark:border-sky-500/30">
            {PRESET_SCRIPTS[selected]}
          </p>
        )}
      </Card>
    </div>
  );
}

function ProSOS() {
  const { settings } = useSettings();
  const { add } = useModuleLogs();
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [script, setScript] = useState("");

  async function submit() {
    if (!context.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const s = await generateGroundingScript(settings, context);
      setScript(s);
      add({
        type: "sos",
        id: uid(),
        timestamp: Date.now(),
        context,
        technique: "ai-grounding",
        mode: "pro",
        aiScript: s,
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
        title="AI 情緒沉降引導"
        subtitle="告訴 AI 你現在焦慮的情境，生成專屬的放鬆引導詞"
      />
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={2}
        placeholder="例如：等一下要上台簡報，超級緊張"
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
      />
      {detectsCrisis(context) && <CrisisSupport />}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <PrimaryButton onClick={submit} disabled={loading || !context.trim()} className="w-full">
        {loading ? "生成中..." : "生成專屬引導詞"}
      </PrimaryButton>
      {script && (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 bg-sky-50 dark:bg-sky-500/10 rounded-xl p-4 border border-sky-200 dark:border-sky-500/30 whitespace-pre-wrap">
          {script}
        </p>
      )}
    </Card>
  );
}

export default function SOS() {
  const { settings } = useSettings();

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">🫁 感受與能量</h1>
        <ModeBadge mode={settings.mode} />
      </header>
      {settings.mode === "pro" ? <ProSOS /> : <LiteSOS />}
      {/* This is the page people reach when they are already struggling, so
          real human help stays one tap away regardless of what they typed. */}
      <CrisisLink />
    </div>
  );
}
