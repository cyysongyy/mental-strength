import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, PrimaryButton, SectionTitle } from "../../components/Card";
import ModeBadge, { NeedsApiKeyNotice } from "../../components/ModeBadge";
import { uid, useModuleLogs, useSettings } from "../../lib/storage";
import { decomposeCircles } from "../../lib/claude";
import { MODULE_META, type CircleItem, type CircleZone } from "../../types";

const ZONES: { id: CircleZone; label: string; hint: string; color: string }[] = [
  { id: "control", label: "控制圈", hint: "你能直接決定或改變的事", color: "border-emerald-400" },
  { id: "influence", label: "影響圈", hint: "你能透過行動或溝通影響的事", color: "border-sky-400" },
  { id: "concern", label: "關注圈", hint: "你在意但無法掌控的事", color: "border-slate-400" },
];

const DISSOLVE_TIP =
  "這件事不在你的掌控範圍內。深呼吸，放下它——這不是放棄，而是把有限的精力留給真正能改變的事。";

function LiteCircles({ onDone }: { onDone: () => void }) {
  const { add } = useModuleLogs();
  const [items, setItems] = useState<CircleItem[]>([]);
  const [input, setInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showDissolve, setShowDissolve] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function addItem() {
    if (!input.trim()) return;
    setItems((prev) => [...prev, { id: uid(), text: input.trim(), zone: null }]);
    setInput("");
  }

  function assign(id: string, zone: CircleZone) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, zone } : it)));
    setSelectedId(null);
    setDragId(null);
    if (zone === "concern") {
      setShowDissolve(true);
      setTimeout(() => setShowDissolve(false), 3200);
    }
  }

  function handleCardClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleZoneClick(zone: CircleZone) {
    if (selectedId) assign(selectedId, zone);
  }

  const unassigned = items.filter((i) => i.zone === null);
  const categorized = items.filter((i) => i.zone !== null);

  function handleSubmit() {
    add({
      type: "circles",
      id: uid(),
      timestamp: Date.now(),
      items,
      mode: "lite",
    });
    setSubmitted(true);
  }

  if (submitted) {
    const control = items.filter((i) => i.zone === "control");
    const influence = items.filter((i) => i.zone === "influence");
    const concern = items.filter((i) => i.zone === "concern");
    return (
      <Card className="space-y-4">
        <SectionTitle title="模組化即時反饋" />
        <div className="space-y-2 text-sm">
          <p className="text-emerald-600 dark:text-emerald-400">
            控制圈 {control.length} 項：把精力優先放在這裡，這些事你可以直接行動。
          </p>
          <p className="text-sky-600 dark:text-sky-400">
            影響圈 {influence.length} 項：試著用溝通、請求或影響力來推動。
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            關注圈 {concern.length} 項：練習放下，把注意力收回自己身上。
          </p>
        </div>
        <PrimaryButton onClick={onDone} className="w-full">
          完成
        </PrimaryButton>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showDissolve && (
        <div className="fixed inset-x-4 top-6 z-50 max-w-lg mx-auto animate-[fadeIn_0.3s_ease]">
          <div className="rounded-xl bg-slate-900/95 dark:bg-slate-800 text-white p-4 text-sm shadow-lg border border-slate-700">
            🌬️ {DISSOLVE_TIP}
          </div>
        </div>
      )}

      <Card className="space-y-3">
        <SectionTitle title="Step 1 · 列出煩心事" subtitle="想到什麼就寫下來，一項一項來" />
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="例如：明天的簡報結果"
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm"
          />
          <PrimaryButton onClick={addItem}>加入</PrimaryButton>
        </div>
        {unassigned.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {unassigned.map((item) => (
              <button
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onClick={() => handleCardClick(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm border cursor-grab active:cursor-grabbing transition-colors ${
                  selectedId === item.id
                    ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                {item.text}
              </button>
            ))}
          </div>
        )}
        {selectedId && (
          <p className="text-xs text-violet-500">已選取，點下方任一圈層分類（或拖曳過去）</p>
        )}
      </Card>

      <div className="space-y-3">
        {ZONES.map((zone) => {
          const zoneItems = items.filter((i) => i.zone === zone.id);
          return (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && assign(dragId, zone.id)}
              onClick={() => handleZoneClick(zone.id)}
              className={`rounded-2xl border-2 border-dashed ${zone.color} p-4 min-h-[80px] cursor-pointer bg-white/50 dark:bg-slate-900/40`}
            >
              <p className="font-semibold text-slate-800 dark:text-slate-100">{zone.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{zone.hint}</p>
              <div className="flex flex-wrap gap-2">
                {zoneItems.map((item) => (
                  <span
                    key={item.id}
                    className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    {item.text}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <PrimaryButton
        onClick={handleSubmit}
        disabled={categorized.length === 0}
        className="w-full"
      >
        完成分類
      </PrimaryButton>
    </div>
  );
}

function ProCircles({ onDone }: { onDone: () => void }) {
  const { settings } = useSettings();
  const { add } = useModuleLogs();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    controllable: string[];
    uncontrollable: string[];
    actions: string[];
  } | null>(null);

  async function submit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const r = await decomposeCircles(settings.apiKey, settings.model, text);
      setResult(r);
      add({
        type: "circles",
        id: uid(),
        timestamp: Date.now(),
        items: [],
        mode: "pro",
        aiBreakdown: r,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  if (!settings.apiKey) return <NeedsApiKeyNotice />;

  return (
    <Card className="space-y-4">
      <SectionTitle
        title="AI 圈層語意拆解器"
        subtitle="描述一件讓你煩心的複雜事件，AI 會拆解出可控與不可控的要素。"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="例如：團隊專案delay，客戶不滿意，主管也在施壓，我覺得整個局面快失控了..."
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-sm"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <PrimaryButton onClick={submit} disabled={loading || !text.trim()} className="w-full">
        {loading ? "分析中..." : "開始拆解"}
      </PrimaryButton>

      {result && (
        <div className="space-y-3 pt-2">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
              可控要素
            </p>
            <ul className="text-sm space-y-1 list-disc pl-4">
              {result.controllable.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              不可控要素（練習放下）
            </p>
            <ul className="text-sm space-y-1 list-disc pl-4">
              {result.uncontrollable.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 p-3">
            <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">
              建議行動指令
            </p>
            <ul className="text-sm space-y-1 list-disc pl-4">
              {result.actions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <PrimaryButton onClick={onDone} className="w-full">
            完成
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

export default function CirclesOfControl() {
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {MODULE_META.circles.icon} {MODULE_META.circles.name}
        </h1>
        <ModeBadge mode={settings.mode} />
      </header>
      {settings.mode === "pro" ? (
        <ProCircles onDone={() => navigate("/modules")} />
      ) : (
        <LiteCircles onDone={() => navigate("/modules")} />
      )}
    </div>
  );
}
