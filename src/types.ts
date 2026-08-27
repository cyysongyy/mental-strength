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
}

export interface ToleranceEntry {
  id: string;
  timestamp: number;
  fear: string;
  durationSec: number;
  completed: boolean;
  mode: "lite" | "pro";
  aiPlan?: { step: number; title: string; description: string }[];
}

export interface SOSEntry {
  id: string;
  timestamp: number;
  context: string;
  technique: "box-breathing" | "ai-grounding";
  mode: "lite" | "pro";
  aiScript?: string;
}

export type ModuleLogEntry =
  | ({ type: "reframe" } & ReframeEntry)
  | ({ type: "circles" } & CirclesEntry)
  | ({ type: "tolerance" } & ToleranceEntry)
  | ({ type: "sos" } & SOSEntry);

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type AppMode = "lite" | "pro";

export type AIProvider = "anthropic" | "google" | "nvidia" | "openai";

export interface Settings {
  mode: AppMode;
  provider: AIProvider;
  apiKeys: Record<AIProvider, string>;
  models: Record<AIProvider, string>;
  name: string;
}

export interface WeeklyReport {
  id: string;
  timestamp: number;
  weekLabel: string;
  content: string;
}
