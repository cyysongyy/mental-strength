import type { ModuleId, ModuleLogEntry } from "../types";

/**
 * One past problem and the answer that resolved it, derived from a saved
 * training log. This is the app's "personal memory" - the same difficulty
 * tends to recur, so what worked last time is the most relevant thing to
 * show (and to hand the AI) the next time it comes up.
 */
export interface MemoryItem {
  id: string;
  timestamp: number;
  type: ModuleId;
  problem: string;
  answer: string;
  plan?: string;
}

function lastCoachLine(dialogue?: { role: "coach" | "user"; text: string }[]) {
  if (!dialogue) return "";
  for (let i = dialogue.length - 1; i >= 0; i--) {
    if (dialogue[i].role === "coach") return dialogue[i].text;
  }
  return "";
}

function toMemory(log: ModuleLogEntry): MemoryItem | null {
  const base = { id: log.id, timestamp: log.timestamp };

  if (log.type === "reframe") {
    const problem = [log.trigger, log.automaticThought].filter(Boolean).join(" — ");
    const answer = log.replacement || lastCoachLine(log.aiDialogue);
    if (!problem || !answer) return null;
    return {
      ...base,
      type: "reframe",
      problem,
      answer,
      plan: log.implementationIntention,
    };
  }

  if (log.type === "circles") {
    const problem = log.items.map((i) => i.text).filter(Boolean).join("、");
    const actions =
      log.aiBreakdown?.actions?.filter(Boolean) ??
      log.items.filter((i) => i.zone === "control").map((i) => i.text);
    const answer = actions.join("；");
    if (!problem || !answer) return null;
    return { ...base, type: "circles", problem, answer };
  }

  if (log.type === "tolerance") {
    const problem = log.fear;
    const answer =
      log.aiPlan?.map((s) => `${s.step}. ${s.title}`).join("；") ||
      (log.completed ? `完成了 ${Math.round(log.durationSec / 60)} 分鐘的耐受練習` : "");
    if (!problem || !answer) return null;
    return {
      ...base,
      type: "tolerance",
      problem,
      answer,
      plan: log.implementationIntention,
    };
  }

  const problem = log.context;
  const answer = log.aiScript || (log.technique === "box-breathing" ? "用箱式呼吸穩定下來" : "");
  if (!problem || !answer) return null;
  return { ...base, type: "sos", problem, answer };
}

export function buildMemories(logs: ModuleLogEntry[]): MemoryItem[] {
  return logs
    .map(toMemory)
    .filter((m): m is MemoryItem => m !== null)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Chinese has no spaces to split on, so fall back to character bigrams for
 * CJK runs (plus whole words for latin text). Crude next to a real
 * segmenter, but it needs no dictionary, no model and no network - which
 * matters because this has to work in Lite mode with no API key at all.
 */
export function tokenize(text: string): Set<string> {
  const tokens = new Set<string>();
  const lower = text.toLowerCase();

  for (const word of lower.match(/[a-z0-9]+/g) ?? []) tokens.add(word);

  for (const run of lower.replace(/[^\u4e00-\u9fff]+/g, " ").split(/\s+/)) {
    if (!run) continue;
    if (run.length === 1) tokens.add(run);
    for (let i = 0; i + 1 < run.length; i++) tokens.add(run.slice(i, i + 2));
  }
  return tokens;
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  if (shared < 2) return 0;
  // Overlap coefficient rather than Jaccard: a short query shouldn't be
  // penalised for matching against a much longer stored entry.
  return shared / Math.min(a.size, b.size);
}

export interface ScoredMemory {
  memory: MemoryItem;
  score: number;
}

export function findRelatedMemories(
  query: string,
  memories: MemoryItem[],
  { limit = 3, minScore = 0.2, excludeId }: { limit?: number; minScore?: number; excludeId?: string } = {},
): ScoredMemory[] {
  const q = tokenize(query);
  if (q.size === 0) return [];

  return memories
    .filter((m) => m.id !== excludeId)
    .map((memory) => ({
      memory,
      score: overlapScore(q, tokenize(`${memory.problem} ${memory.answer}`)),
    }))
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function searchMemories(query: string, memories: MemoryItem[]): MemoryItem[] {
  const trimmed = query.trim();
  if (!trimmed) return memories;
  const scored = findRelatedMemories(trimmed, memories, { limit: memories.length, minScore: 0.05 });
  if (scored.length > 0) return scored.map((s) => s.memory);
  // Fall back to a plain substring match so an exact phrase always finds its
  // entry even when it is too short to score on token overlap.
  const lower = trimmed.toLowerCase();
  return memories.filter((m) =>
    `${m.problem} ${m.answer}`.toLowerCase().includes(lower),
  );
}

/** Compact past context to hand the AI so it picks up where you left off. */
export function memoriesForPrompt(memories: ScoredMemory[]): string {
  if (memories.length === 0) return "";
  const lines = memories.map(
    ({ memory }) =>
      `- 過去的困擾：${memory.problem}\n  當時有效的做法：${memory.answer}` +
      (memory.plan ? `\n  當時訂的計畫：${memory.plan}` : ""),
  );
  return `以下是這位使用者過去在 App 中記錄過的類似情況與當時有效的做法，請把它當作背景脈絡，適時提醒他「你上次是這樣走出來的」，但不要生硬地照唸：\n${lines.join("\n")}`;
}
