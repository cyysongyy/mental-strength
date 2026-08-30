import type { ZenEntry } from "../types";

/**
 * Reads a 鬆弛感 (zen-strength-reflection) session out of localStorage.
 *
 * Both apps are served from cyysongyy.github.io. localStorage is scoped to an
 * origin, not a path, so the two already share one store - no export file, no
 * server, no copy-paste. The key prefixes do not collide (`zsb_` vs `ms.`).
 *
 * That app keeps only the current session under a single key, so what is
 * readable here is its latest one. Everything is treated as untrusted shape:
 * it is written by a different codebase that can change without this one
 * knowing, and a half-filled session is the normal case rather than the
 * exception.
 */
export const ZEN_SESSION_KEY = "zsb_session";
export const ZEN_APP_URL = "https://cyysongyy.github.io/zen-strength-reflection/";

const ARCHETYPE_NAMES: Record<string, string> = {
  controller: "強勢者",
  suppressed: "不敢示弱者",
  pleaser: "討好者",
  insecure: "低安全感者",
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function num(v: unknown, fallback = 50): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map(str).filter(Boolean) : [];
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

export function readZenSession(): ZenEntry | null {
  const s = zenImportStatus();
  return s.status === "ready" ? s.entry : null;
}

/**
 * Why there is nothing to import, not just that there is nothing.
 *
 * The first version of the import card rendered only when a session was
 * found, which made "you have not used that app in this browser" look
 * identical to "this feature has not shipped yet" - a distinction only the
 * person looking at the screen can resolve, and they had nothing to go on.
 */
export type ZenImportStatus =
  /** No 鬆弛感 data in this browser at all. */
  | { status: "none" }
  /** Its data is there but unreadable - a shape this build does not know. */
  | { status: "unreadable" }
  /** A session exists, but nothing was written in it. */
  | { status: "empty"; entry: ZenEntry }
  | { status: "ready"; entry: ZenEntry };

export function zenImportStatus(): ZenImportStatus {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(ZEN_SESSION_KEY);
  } catch {
    return { status: "none" };
  }
  if (!raw) return { status: "none" };

  let parsed: Record<string, unknown>;
  try {
    parsed = obj(JSON.parse(raw));
  } catch {
    return { status: "unreadable" };
  }

  const id = str(parsed.id);
  if (!id) return { status: "unreadable" };

  const entry = parse(id, parsed);
  return zenHasContent(entry) ? { status: "ready", entry } : { status: "empty", entry };
}

function parse(id: string, parsed: Record<string, unknown>): ZenEntry {

  const ev = obj(parsed.event);
  const locate = obj(parsed.locate);
  const st1 = obj(parsed.st1);
  const st2 = obj(parsed.st2);
  const st3 = obj(parsed.st3);
  const st4 = obj(parsed.st4);
  const st5 = obj(parsed.st5);
  const ex = obj(parsed.ex);

  // The session's own timestamp, so re-importing does not move the record to
  // today - and so it lands in the timeline where it actually happened.
  const created = Date.parse(str(parsed.updatedAt) || str(parsed.createdAt));
  const archetypeKey = str(locate.archetype);

  return {
    id,
    timestamp: Number.isNaN(created) ? Date.now() : created,
    situation: str(ev.situation),
    emotions: strArray(ev.emotions),
    body: str(ev.body),
    locate: {
      inner: num(locate.inner),
      outer: num(locate.outer),
      archetype: ARCHETYPE_NAMES[archetypeKey] ?? archetypeKey,
    },
    script: { chosen: str(st1.script), rewritten: str(st1.new) },
    roles: {
      mother: num(st2.mother),
      father: num(st2.father),
      feel: str(st2.feel),
      aim: str(st2.aim),
    },
    language: {
      stim: str(st3.stim),
      emo: str(st3.emo),
      thought: str(st3.thought),
      praise: str(st3.praise),
    },
    label: {
      label: str(st4.label),
      source: str(st4.source),
      purpose: str(st4.purpose),
      reframe: str(st4.reframe),
    },
    relation: { need: str(st5.need), share: str(st5.share), respond: str(st5.respond) },
    external: {
      anti: str(ex.anti),
      mistake: str(ex.mistake),
      desire: num(ex.desire),
      reason: num(ex.reason),
      boundary: str(ex.boundary),
    },
    summary: str(parsed.summary),
  };
}

/**
 * A session with nothing written in it is not worth importing - opening the
 * other app and backing out immediately still leaves a session object behind.
 */
export function zenHasContent(entry: ZenEntry): boolean {
  return [
    entry.situation,
    entry.body,
    entry.script.rewritten,
    entry.roles.feel,
    entry.language.thought,
    entry.label.reframe,
    entry.relation.respond,
    entry.external.boundary,
    entry.summary,
  ].some(Boolean) || entry.emotions.length > 0;
}
