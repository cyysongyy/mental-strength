import { DISTORTIONS } from "./distortions";
import { TOUGHNESS_DIMENSIONS, TOUGHNESS_DIMENSION_META } from "./toughness";
import {
  MODULE_META,
  type CheckIn,
  type CircleZone,
  type ModuleId,
  type ModuleLogEntry,
  type ToughnessEntry,
} from "../types";

/**
 * A flat, chronological view of everything that has ever been saved.
 *
 * The training database deliberately summarises - it keeps only
 * problem→answer so it can group recurrences and measure trends, and it drops
 * records with no answer entirely. That makes it the wrong place to go
 * looking for "what exactly did I write on the 14th". This module exists to
 * show every saved record with every field it actually holds, dropping
 * nothing.
 */

export type RecordKind = ModuleId | "checkin" | "toughness";

export interface RecordDetail {
  label: string;
  value: string;
  /** Rendered as a highlighted block rather than a plain line. */
  emphasis?: boolean;
}

export interface RecordItem {
  id: string;
  timestamp: number;
  kind: RecordKind;
  icon: string;
  kindLabel: string;
  /** One-line summary for the collapsed row. */
  summary: string;
  details: RecordDetail[];
  mode?: "lite" | "pro";
}

const ZONE_LABEL: Record<CircleZone, string> = {
  control: "可以控制",
  influence: "可以影響",
  concern: "只能關注",
};

function distortionLabel(id: string) {
  return DISTORTIONS.find((d) => d.id === id)?.label ?? id;
}

function intensityDetail(intensity?: { before?: number; after?: number }): RecordDetail[] {
  if (!intensity) return [];
  const { before, after } = intensity;
  if (typeof before !== "number" || typeof after !== "number") return [];
  const drop = before - after;
  const suffix = drop > 0 ? `（下降 ${drop} 分）` : drop === 0 ? "（持平）" : `（上升 ${-drop} 分）`;
  return [{ label: "情緒強度", value: `${before} → ${after} ${suffix}` }];
}

function nonEmpty(details: RecordDetail[]): RecordDetail[] {
  return details.filter((d) => d.value !== "" && d.value !== undefined);
}

function fromModuleLog(log: ModuleLogEntry): RecordItem {
  const meta = MODULE_META[log.type];
  const base = {
    id: log.id,
    timestamp: log.timestamp,
    kind: log.type,
    icon: meta.icon,
    kindLabel: meta.name,
    mode: log.mode,
  };

  if (log.type === "reframe") {
    return {
      ...base,
      summary: log.trigger || log.automaticThought || "（未填寫觸發事件）",
      details: nonEmpty([
        { label: "觸發事件", value: log.trigger },
        { label: "自動化想法", value: log.automaticThought },
        {
          label: "辨識到的思維陷阱",
          value: log.distortions.map(distortionLabel).join("、"),
        },
        { label: "支持這個想法的證據", value: log.factCheck.forIt },
        { label: "不支持的證據", value: log.factCheck.againstIt },
        { label: "替代想法", value: log.replacement, emphasis: true },
        { label: "若-則計畫", value: log.implementationIntention ?? "" },
        ...intensityDetail(log.intensity),
        {
          label: "AI 對話",
          value: (log.aiDialogue ?? [])
            .map((d) => `${d.role === "coach" ? "教練" : "你"}：${d.text}`)
            .join("\n\n"),
        },
      ]),
    };
  }

  if (log.type === "circles") {
    return {
      ...base,
      summary: log.items.map((i) => i.text).filter(Boolean).join("、") || "（未填寫）",
      details: nonEmpty([
        {
          label: "列出的煩心事",
          value: log.items
            .map((i) => `${i.text}${i.zone ? `（${ZONE_LABEL[i.zone]}）` : ""}`)
            .join("\n"),
        },
        { label: "AI 判定可控", value: log.aiBreakdown?.controllable.join("、") ?? "" },
        { label: "AI 判定不可控", value: log.aiBreakdown?.uncontrollable.join("、") ?? "" },
        {
          label: "建議行動",
          value: log.aiBreakdown?.actions.join("\n") ?? "",
          emphasis: true,
        },
        ...intensityDetail(log.intensity),
      ]),
    };
  }

  if (log.type === "tolerance") {
    const minutes = Math.round(log.durationSec / 60);
    return {
      ...base,
      summary: log.fear || "（未填寫）",
      details: nonEmpty([
        { label: "面對的不適", value: log.fear },
        {
          label: "計時挑戰",
          value: `${minutes} 分鐘 ・ ${log.completed ? "有完成" : "未完成"}`,
        },
        {
          label: "微型暴露階梯",
          value: (log.aiPlan ?? [])
            .map((s) => `${s.step}. ${s.title} — ${s.description}`)
            .join("\n"),
          emphasis: true,
        },
        { label: "若-則計畫", value: log.implementationIntention ?? "" },
        ...intensityDetail(log.intensity),
      ]),
    };
  }

  return {
    ...base,
    summary: log.context || "（未填寫情境）",
    details: nonEmpty([
      { label: "當時的情境", value: log.context },
      {
        label: "使用的技巧",
        value: log.technique === "box-breathing" ? "箱式呼吸" : "AI 情緒沉降引導",
      },
      { label: "AI 引導詞", value: log.aiScript ?? "", emphasis: true },
      ...intensityDetail(log.intensity),
    ]),
  };
}

function fromCheckIn(c: CheckIn): RecordItem {
  return {
    id: c.id,
    timestamp: c.timestamp,
    kind: "checkin",
    icon: "📝",
    kindLabel: "每日快測",
    summary: `壓力 ${c.stress} ・ 掌控感 ${c.control}`,
    details: [
      { label: "壓力程度", value: `${c.stress} / 10` },
      { label: "掌控感", value: `${c.control} / 10` },
      { label: "當時推薦的模組", value: MODULE_META[c.recommended].name },
    ],
  };
}

function fromToughness(t: ToughnessEntry): RecordItem {
  return {
    id: t.id,
    timestamp: t.timestamp,
    kind: "toughness",
    icon: "🧭",
    kindLabel: "4Cs 韌性測驗",
    summary: TOUGHNESS_DIMENSIONS.map(
      (d) => `${TOUGHNESS_DIMENSION_META[d].name} ${t.scores[d].toFixed(1)}`,
    ).join(" ・ "),
    details: [
      ...TOUGHNESS_DIMENSIONS.map((d) => ({
        label: TOUGHNESS_DIMENSION_META[d].name,
        value: `${t.scores[d].toFixed(1)} / 5.0`,
      })),
      { label: "作答", value: t.answers.map((a, i) => `第 ${i + 1} 題：${a}`).join("、") },
    ],
  };
}

/** Everything ever saved, newest first. Nothing is filtered out. */
export function buildRecords(
  logs: ModuleLogEntry[],
  checkIns: CheckIn[],
  toughness: ToughnessEntry[],
): RecordItem[] {
  return [
    ...logs.map(fromModuleLog),
    ...checkIns.map(fromCheckIn),
    ...toughness.map(fromToughness),
  ].sort((a, b) => b.timestamp - a.timestamp);
}

export const RECORD_KIND_LABELS: { id: RecordKind | "all"; label: string; icon: string }[] = [
  { id: "all", label: "全部", icon: "🗂️" },
  { id: "reframe", label: MODULE_META.reframe.name, icon: MODULE_META.reframe.icon },
  { id: "circles", label: MODULE_META.circles.name, icon: MODULE_META.circles.icon },
  { id: "tolerance", label: MODULE_META.tolerance.name, icon: MODULE_META.tolerance.icon },
  { id: "sos", label: MODULE_META.sos.name, icon: MODULE_META.sos.icon },
  { id: "checkin", label: "每日快測", icon: "📝" },
  { id: "toughness", label: "4Cs 測驗", icon: "🧭" },
];
