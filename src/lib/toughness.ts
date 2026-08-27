import type { ToughnessDimension, ToughnessEntry } from "../types";

export const TOUGHNESS_DIMENSION_META: Record<
  ToughnessDimension,
  { name: string; short: string; icon: string; color: string }
> = {
  challenge: {
    name: "挑戰 Challenge",
    short: "把變化與壓力看成機會而非威脅",
    icon: "🧗",
    color: "from-rose-500 to-pink-500",
  },
  commitment: {
    name: "承諾 Commitment",
    short: "設定目標並堅持完成",
    icon: "🎯",
    color: "from-amber-500 to-orange-500",
  },
  control: {
    name: "控制 Control",
    short: "對生活與情緒的掌控感",
    icon: "🧭",
    color: "from-emerald-500 to-teal-500",
  },
  confidence: {
    name: "信心 Confidence",
    short: "自我效能與人際信心",
    icon: "💪",
    color: "from-sky-500 to-cyan-500",
  },
};

export const TOUGHNESS_DIMENSIONS: ToughnessDimension[] = [
  "challenge",
  "commitment",
  "control",
  "confidence",
];

export interface ToughnessItem {
  dimension: ToughnessDimension;
  text: string;
}

export const TOUGHNESS_ITEMS: ToughnessItem[] = [
  { dimension: "challenge", text: "當計畫被打亂時，我通常能很快找到新的因應方式。" },
  { dimension: "challenge", text: "面對困難的任務，我把它看成成長的機會，而不只是威脅。" },
  { dimension: "challenge", text: "遇到意外的變化，我不會因此亂了陣腳。" },
  { dimension: "commitment", text: "一旦設定目標，我會堅持到底，即使過程辛苦。" },
  { dimension: "commitment", text: "我很少半途而廢，即使一開始的熱情已經消退。" },
  { dimension: "commitment", text: "我習慣把大目標拆解成具體步驟並確實執行。" },
  { dimension: "control", text: "我覺得自己能掌控生活中大部分重要的事。" },
  { dimension: "control", text: "即使情緒很強烈，我通常也能讓自己冷靜下來。" },
  { dimension: "control", text: "別人的負面情緒或批評不太容易影響我的心情。" },
  { dimension: "confidence", text: "我相信自己有能力應付大部分的挑戰。" },
  { dimension: "confidence", text: "即使遇到挫折，我對自己的能力仍有信心。" },
  { dimension: "confidence", text: "在人群中表達自己的想法，我感到自在。" },
];

export const LIKERT_LABELS = ["非常不同意", "不同意", "普通", "同意", "非常同意"];

export function scoreToughness(answers: number[]): Record<ToughnessDimension, number> {
  const sums: Record<ToughnessDimension, number> = {
    challenge: 0,
    commitment: 0,
    control: 0,
    confidence: 0,
  };
  const counts: Record<ToughnessDimension, number> = {
    challenge: 0,
    commitment: 0,
    control: 0,
    confidence: 0,
  };
  TOUGHNESS_ITEMS.forEach((item, i) => {
    sums[item.dimension] += answers[i] ?? 0;
    counts[item.dimension] += 1;
  });
  const scores = {} as Record<ToughnessDimension, number>;
  for (const dim of TOUGHNESS_DIMENSIONS) {
    scores[dim] = counts[dim] ? sums[dim] / counts[dim] : 0;
  }
  return scores;
}

export function toughnessLevel(score: number): { label: string; color: string } {
  if (score >= 3.8) return { label: "良好", color: "text-emerald-500" };
  if (score >= 2.8) return { label: "中等", color: "text-amber-500" };
  return { label: "待加強", color: "text-rose-500" };
}

export function overallToughness(entry: ToughnessEntry): number {
  const values = TOUGHNESS_DIMENSIONS.map((d) => entry.scores[d]);
  return values.reduce((a, b) => a + b, 0) / values.length;
}
