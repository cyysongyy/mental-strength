import type { ModuleId } from "../types";
import { textSimilarity, type MemoryItem } from "./memory";

export type ThemeId = "work" | "relationship" | "selfworth" | "future" | "body" | "other";

export const THEME_META: Record<ThemeId, { name: string; icon: string; color: string }> = {
  work: { name: "工作與職場", icon: "💼", color: "from-indigo-500 to-blue-500" },
  relationship: { name: "人際與關係", icon: "🤝", color: "from-rose-500 to-pink-500" },
  selfworth: { name: "自我價值", icon: "🪞", color: "from-violet-500 to-purple-500" },
  future: { name: "未來與不確定", icon: "🧭", color: "from-amber-500 to-orange-500" },
  body: { name: "身心狀態", icon: "🫀", color: "from-teal-500 to-emerald-500" },
  other: { name: "其他", icon: "📌", color: "from-slate-400 to-slate-500" },
};

// Substring rules rather than a model: they run offline, cost nothing, and are
// easy to read and adjust. Order matters only for ties - first match wins.
const THEME_KEYWORDS: [ThemeId, string[]][] = [
  [
    "work",
    ["主管", "老闆", "上司", "同事", "會議", "報告", "簡報", "專案", "加班", "工作", "職場", "客戶", "績效", "面試", "上班", "離職", "薪水", "deadline", "截止"],
  ],
  [
    "relationship",
    ["朋友", "家人", "父母", "爸", "媽", "伴侶", "另一半", "男友", "女友", "老公", "老婆", "小孩", "溝通", "吵架", "誤會", "拒絕", "孤單", "被討厭", "關係"],
  ],
  [
    "selfworth",
    ["不夠好", "不夠", "失敗", "比較", "沒用", "不適合", "自責", "完美", "能力", "配不上", "丟臉", "笨", "糟糕", "沒價值", "否定"],
  ],
  [
    "future",
    ["未來", "不確定", "計畫", "決定", "選擇", "擔心", "萬一", "如果", "changes", "轉職", "搬家", "考試", "風險"],
  ],
  [
    "body",
    ["睡", "累", "疲憊", "身體", "生病", "焦慮", "恐慌", "呼吸", "心悸", "頭痛", "胃", "失眠", "沒力氣"],
  ],
];

export function classifyTheme(text: string): ThemeId {
  for (const [theme, words] of THEME_KEYWORDS) {
    if (words.some((w) => text.includes(w))) return theme;
  }
  return "other";
}

/**
 * A recurring situation, with every time it has been trained on. This is the
 * unit the user actually cares about - "this keeps happening to me" - rather
 * than the individual practice sessions it happens to be made of.
 */
export interface EventThread {
  id: string;
  title: string;
  theme: ThemeId;
  occurrences: MemoryItem[];
  firstAt: number;
  lastAt: number;
  modules: ModuleId[];
  latestAnswer: string;
  latestPlan?: string;
}

// Two entries belong to the same event above this overlap. Set high enough
// that unrelated worries stay apart, low enough that the same situation
// described in different words still merges.
const SAME_EVENT_THRESHOLD = 0.3;

function toThread(occurrences: MemoryItem[]): EventThread {
  const sorted = [...occurrences].sort((a, b) => b.timestamp - a.timestamp);
  const latest = sorted[0];
  const withPlan = sorted.find((m) => m.plan);
  return {
    id: latest.id,
    title: latest.problem,
    theme: classifyTheme(sorted.map((m) => m.problem).join(" ")),
    occurrences: sorted,
    firstAt: sorted[sorted.length - 1].timestamp,
    lastAt: latest.timestamp,
    modules: [...new Set(sorted.map((m) => m.type))],
    latestAnswer: latest.answer,
    latestPlan: withPlan?.plan,
  };
}

/**
 * Greedy single-pass clustering: each entry joins the first existing group it
 * is similar enough to, otherwise starts its own. Good enough for a personal
 * log, and deterministic - the same data always produces the same grouping.
 */
export function buildEventThreads(memories: MemoryItem[]): EventThread[] {
  const groups: MemoryItem[][] = [];

  for (const memory of [...memories].sort((a, b) => a.timestamp - b.timestamp)) {
    const match = groups.find((group) =>
      group.some((m) => textSimilarity(m.problem, memory.problem) >= SAME_EVENT_THRESHOLD),
    );
    if (match) match.push(memory);
    else groups.push([memory]);
  }

  return groups.map(toThread).sort((a, b) => b.lastAt - a.lastAt);
}

export interface ThemeStat {
  theme: ThemeId;
  eventCount: number;
  sessionCount: number;
}

/** Which kinds of situation come up most - the shape of your training so far. */
export function themeStats(threads: EventThread[]): ThemeStat[] {
  const map = new Map<ThemeId, ThemeStat>();
  for (const t of threads) {
    const stat = map.get(t.theme) ?? { theme: t.theme, eventCount: 0, sessionCount: 0 };
    stat.eventCount += 1;
    stat.sessionCount += t.occurrences.length;
    map.set(t.theme, stat);
  }
  return [...map.values()].sort((a, b) => b.sessionCount - a.sessionCount);
}
