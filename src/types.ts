export type ModuleId = "reframe" | "circles" | "tolerance" | "sos";

export const MODULE_META: Record<
  ModuleId,
  { name: string; short: string; icon: string; color: string }
> = {
  reframe: {
    name: "認知重構",
    short: "把想法拆開，換個角度看",
    icon: "🧠",
    color: "from-violet-500 to-indigo-500",
  },
  circles: {
    name: "目標控制",
    short: "分清楚什麼該放管",
    icon: "🎯",
    color: "from-emerald-500 to-teal-500",
  },
  tolerance: {
    name: "情緒耐受",
    short: "帶著不適感撐一下",
    icon: "⏱️",
    color: "from-amber-500 to-orange-500",
  },
  sos: {
    name: "感受與能量",
    short: "立刻讓自己穩下來",
    icon: "🫁",
    color: "from-sky-500 to-cyan-500",
  },
};

/**
 * Where a saved record came from. Wider than ModuleId because 鬆弛感
 * (zen-strength-reflection) is a separate app whose sessions can be imported
 * here - it is a real source of records, but not a module you can navigate
 * to, so it stays out of ModuleId and the module grids.
 */
export type LogSource = ModuleId | "zen";

export const SOURCE_META: Record<
  LogSource,
  { name: string; short: string; icon: string; color: string }
> = {
  ...MODULE_META,
  zen: {
    name: "鬆弛感手記",
    short: "從「鬆弛感」匯入的內在重建",
    icon: "🪷",
    color: "from-lime-600 to-emerald-600",
  },
};

export const MODULE_ROUTES: Record<ModuleId, string> = {
  reframe: "/modules/reframe",
  circles: "/modules/circles",
  tolerance: "/modules/tolerance",
  sos: "/sos",
};

export interface CheckIn {
  id: string;
  date: string; // yyyy-mm-dd
  timestamp: number;
  stress: number; // 1-10
  control: number; // 1-10
  recommended: ModuleId;
}

export interface DistortionTag {
  id: string;
  label: string;
  description: string;
}

/**
 * Distress rating before and after a practice, 0-10 (SUDS). Optional because
 * older entries predate it - anything reading these must tolerate undefined.
 */
export interface IntensityRating {
  before?: number;
  after?: number;
}

export interface ReframeEntry {
  id: string;
  timestamp: number;
  trigger: string;
  automaticThought: string;
  distortions: string[]; // DistortionTag ids
  factCheck: { forIt: string; againstIt: string };
  replacement: string;
  mode: "lite" | "pro";
  aiDialogue?: { role: "coach" | "user"; text: string }[];
  implementationIntention?: string;
  intensity?: IntensityRating;
}

export type CircleZone = "control" | "influence" | "concern";

export interface CircleItem {
  id: string;
  text: string;
  zone: CircleZone | null;
}

export interface CirclesEntry {
  id: string;
  timestamp: number;
  items: CircleItem[];
  mode: "lite" | "pro";
  aiBreakdown?: { controllable: string[]; uncontrollable: string[]; actions: string[] };
  intensity?: IntensityRating;
}

export interface ToleranceEntry {
  id: string;
  timestamp: number;
  fear: string;
  durationSec: number;
  completed: boolean;
  mode: "lite" | "pro";
  aiPlan?: { step: number; title: string; description: string }[];
  implementationIntention?: string;
  intensity?: IntensityRating;
}

export interface SOSEntry {
  id: string;
  timestamp: number;
  context: string;
  technique: "box-breathing" | "ai-grounding";
  mode: "lite" | "pro";
  aiScript?: string;
  intensity?: IntensityRating;
}

/**
 * One 鬆弛感 session, imported from the separate zen-strength-reflection app.
 * Both apps are served from cyysongyy.github.io, so they share an origin and
 * therefore a localStorage - the import reads that app's key directly rather
 * than going through a file or a server.
 *
 * Every field is optional-shaped (empty strings, empty arrays) because it is
 * data written by another app: a session abandoned partway, or a future
 * version of that app, must not be able to crash this one.
 */
export interface ZenEntry {
  id: string;
  timestamp: number;
  situation: string;
  emotions: string[];
  body: string;
  locate: { inner: number; outer: number; archetype: string };
  script: { chosen: string; rewritten: string };
  roles: { mother: number; father: number; feel: string; aim: string };
  language: { stim: string; emo: string; thought: string; praise: string };
  label: { label: string; source: string; purpose: string; reframe: string };
  relation: { need: string; share: string; respond: string };
  external: {
    anti: string;
    mistake: string;
    desire: number;
    reason: number;
    boundary: string;
  };
  summary: string;
}

export type ModuleLogEntry =
  | ({ type: "reframe" } & ReframeEntry)
  | ({ type: "circles" } & CirclesEntry)
  | ({ type: "tolerance" } & ToleranceEntry)
  | ({ type: "sos" } & SOSEntry)
  | ({ type: "zen" } & ZenEntry);

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type AppMode = "lite" | "pro";

export type AIProvider = "anthropic" | "google" | "nvidia" | "openai";

/** Root text-size preference. Kept device-local - screen size and eyesight
 * conditions differ per device, so it is not something to sync. */
export type FontScale = "standard" | "large" | "xlarge";

export interface Settings {
  mode: AppMode;
  provider: AIProvider;
  apiKeys: Record<AIProvider, string>;
  models: Record<AIProvider, string>;
  name: string;
  cloudSync: { url: string; anonKey: string };
  fontScale: FontScale;
}

export interface WeeklyReport {
  id: string;
  timestamp: number;
  weekLabel: string;
  content: string;
}

export type ToughnessDimension = "challenge" | "commitment" | "control" | "confidence";

export interface ToughnessEntry {
  id: string;
  timestamp: number;
  answers: number[]; // 12 raw 1-5 answers, in TOUGHNESS_ITEMS order
  scores: Record<ToughnessDimension, number>; // 1-5 average per dimension
}
