import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, GhostButton, PrimaryButton, SectionTitle } from "../../components/Card";
import ModeBadge, { NeedsApiKeyNotice } from "../../components/ModeBadge";
import { DISTORTIONS, REPLACEMENT_TEMPLATES } from "../../lib/distortions";
import { uid, useModuleLogs, useSettings } from "../../lib/storage";
import { reframeChat, type ChatTurn } from "../../lib/claude";
import { MODULE_META } from "../../types";

function LiteReframe({ onDone }: { onDone: () => void }) {
  const { add } = useModuleLogs();
  const [step, setStep] = useState(1);
  const [trigger, setTrigger] = useState("");
  const [thought, setThought] = useState("");
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [forIt, setForIt] = useState("");
  const [againstIt, setAgainstIt] = useState("");
  const [replacement, setReplacement] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggleDistortion(id: string) {
    setSelectedDistortions((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }

  const suggestions = selectedDistortions.flatMap(
    (id) => REPLACEMENT_TEMPLATES[id] ?? [],
  );

  function handleSubmit() {
    add({
      type: "reframe",
      id: uid(),
      timestamp: Date.now(),
      trigger,
      automaticThought: thought,
      distortions: selectedDistortions,
      factCheck: { forIt, againstIt },
      replacement,
      mode: "lite",
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="space-y-3">
        <SectionTitle title="模組化即時反饋" />
        <p className="text-slate-700 dark:text-slate-200">
          你辨識出了 <b>{selectedDistortions.length}</b> 個消極思維模式，並完成了事實核查。
        </p>
        <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 p-4 border border-violet-200 dark:border-violet-500/30">
          <p className="text-xs text-violet-500 font-medium mb-1">你的替代想法</p>
          <p className="text-slate-800 dark:text-violet-100">{replacement || "（未填寫）"}</p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          小提示：下次浮現類似的自動化思維時，試著先停下來問自己「有什麼證據支持/不支持這個想法？」
        </p>
        <PrimaryButton onClick={onDone} className="w-full">
          完成
        </PrimaryButton>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      {step === 1 && (
        <>
          <SectionTitle title="Step 1 · 觸發事件" subtitle="發生了什麼事，讓你有這樣的感覺？" />
          <textarea
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
            placeholder="例如：主管在會議上指出我的報告有問題"
          />
          <PrimaryButton
            onClick={() => setStep(2)}
            disabled={!trigger.trim()}
            className="w-full"
          >
            下一步
          </PrimaryButton>
        </>
      )}

      {step === 2 && (
        <>
          <SectionTitle
            title="Step 2 · 自動化消極思維"
            subtitle="當下腦中浮現的第一個念頭是什麼？"
          />
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
            placeholder="例如：我完全不適合這份工作"
          />
          <div className="flex gap-2">
            <GhostButton onClick={() => setStep(1)}>上一步</GhostButton>
            <PrimaryButton
              onClick={() => setStep(3)}
              disabled={!thought.trim()}
              className="flex-1"
            >
              下一步
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <SectionTitle
            title="Step 3 · 勾選消極思維模式"
            subtitle="這個念頭裡，是否有以下的思維陷阱？（可複選）"
          />
          <div className="flex flex-wrap gap-2">
            {DISTORTIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => toggleDistortion(d.id)}
                title={d.description}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedDistortions.includes(d.id)
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {selectedDistortions.length > 0 && (
            <ul className="text-sm text-slate-500 dark:text-slate-400 list-disc pl-5 space-y-1">
              {selectedDistortions.map((id) => (
                <li key={id}>{DISTORTIONS.find((d) => d.id === id)?.description}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <GhostButton onClick={() => setStep(2)}>上一步</GhostButton>
            <PrimaryButton onClick={() => setStep(4)} className="flex-1">
              下一步
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <SectionTitle title="Step 3 · 事實核查清單" subtitle="用證據檢視這個想法" />
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              支持這個想法的證據
            </label>
            <textarea
              value={forIt}
              onChange={(e) => setForIt(e.target.value)}
              rows={2}
              className="w-full mt-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              不支持這個想法的證據
            </label>
            <textarea
              value={againstIt}
              onChange={(e) => setAgainstIt(e.target.value)}
              rows={2}
              className="w-full mt-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <GhostButton onClick={() => setStep(3)}>上一步</GhostButton>
            <PrimaryButton onClick={() => setStep(5)} className="flex-1">
              下一步
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <SectionTitle
            title="Step 4 · 點擊替換卡片"
            subtitle="選一句貼近你狀況的替代想法，或自己編輯"
          />
          <div className="space-y-2">
            {suggestions.length === 0 && (
              <p className="text-sm text-slate-400">
                （未勾選思維模式，可直接在下方自行填寫替代想法）
              </p>
            )}
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setReplacement(s)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                  replacement === s
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <textarea
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            rows={2}
            placeholder="或自己寫下替代想法..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
          />
          <div className="flex gap-2">
            <GhostButton onClick={() => setStep(4)}>上一步</GhostButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={!replacement.trim()}
              className="flex-1"
            >
              完成練習
            </PrimaryButton>
          </div>
        </>
      )}
    </Card>
  );
}

function ProReframe({ onDone }: { onDone: () => void }) {
  const { settings } = useSettings();
  const { add } = useModuleLogs();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!input.trim() || loading) return;
    const nextHistory: ChatTurn[] = [...history, { role: "user", content: input }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const reply = await reframeChat(settings.apiKey, settings.model, nextHistory);
      setHistory([...nextHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    if (history.length === 0) return;
    add({
      type: "reframe",
      id: uid(),
      timestamp: Date.now(),
      trigger: history[0]?.content ?? "",
      automaticThought: "",
      distortions: [],
      factCheck: { forIt: "", againstIt: "" },
      replacement: "",
      mode: "pro",
      aiDialogue: history.map((h) => ({
        role: h.role === "assistant" ? "coach" : "user",
        text: h.content,
      })),
    });
    onDone();
  }

  if (!settings.apiKey) return <NeedsApiKeyNotice />;

  return (
    <Card className="space-y-4">
      <SectionTitle
        title="AI 蘇格拉底對話教練"
        subtitle="自由寫下讓你困擾的事件或想法，AI 教練會引導你重新檢視。"
      />
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((h, i) => (
          <div
            key={i}
            className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
              h.role === "user"
                ? "ml-auto bg-violet-600 text-white rounded-br-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
            }`}
          >
            {h.content}
          </div>
        ))}
        {loading && (
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl p-3 text-sm w-fit">
            教練思考中...
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="寫下發生的事或你的想法..."
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
        />
        <PrimaryButton onClick={send} disabled={loading || !input.trim()}>
          送出
        </PrimaryButton>
      </div>
      {history.length > 1 && (
        <button
          onClick={finish}
          className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-violet-500"
        >
          結束並儲存這次對話
        </button>
      )}
    </Card>
  );
}

export default function CognitiveReframe() {
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {MODULE_META.reframe.icon} {MODULE_META.reframe.name}
        </h1>
        <ModeBadge mode={settings.mode} />
      </header>
      {settings.mode === "pro" ? (
        <ProReframe onDone={() => navigate("/modules")} />
      ) : (
        <LiteReframe onDone={() => navigate("/modules")} />
      )}
    </div>
  );
}
