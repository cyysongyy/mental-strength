import { useCallback, useEffect, useState } from "react";
import type {
  CheckIn,
  ModuleLogEntry,
  Settings,
  ToughnessEntry,
  WeeklyReport,
} from "../types";

export const KEYS = {
  checkins: "ms.checkins.v1",
  logs: "ms.logs.v1",
  settings: "ms.settings.v1",
  reports: "ms.reports.v1",
  badges: "ms.badges.v1",
  toughness: "ms.toughness.v1",
  drafts: "ms.drafts.v1",
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ms-storage", { detail: { key } }));
}

// Everything except "settings" - that key holds the user's AI provider API
// keys, which must never leave this device even when cloud sync is on.
export const SYNCED_KEYS: string[] = [
  KEYS.checkins,
  KEYS.logs,
  KEYS.reports,
  KEYS.badges,
  KEYS.toughness,
];

export const defaultSettings: Settings = {
  mode: "lite",
  provider: "anthropic",
  apiKeys: { anthropic: "", google: "", nvidia: "", openai: "" },
  models: {
    anthropic: "claude-sonnet-5",
    google: "gemini-2.5-flash",
    nvidia: "meta/llama-3.1-405b-instruct",
    openai: "gpt-4o-mini",
  },
  name: "",
  cloudSync: { url: "", anonKey: "" },
};

function useStoredList<T>(key: string) {
  const [items, setItems] = useState<T[]>(() => readJSON(key, [] as T[]));

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) setItems(readJSON(key, [] as T[]));
    };
    window.addEventListener("ms-storage", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("ms-storage", handler);
      window.removeEventListener("storage", handler);
    };
  }, [key]);

  const add = useCallback(
    (item: T) => {
      const next = [...readJSON<T[]>(key, []), item];
      writeJSON(key, next);
      setItems(next);
    },
    [key],
  );

  const replaceAll = useCallback(
    (next: T[]) => {
      writeJSON(key, next);
      setItems(next);
    },
    [key],
  );

  return { items, add, replaceAll };
}

export function useCheckIns() {
  return useStoredList<CheckIn>(KEYS.checkins);
}

export function useModuleLogs() {
  return useStoredList<ModuleLogEntry>(KEYS.logs);
}

export function useWeeklyReports() {
  return useStoredList<WeeklyReport>(KEYS.reports);
}

export function useToughnessEntries() {
  return useStoredList<ToughnessEntry>(KEYS.toughness);
}

// Merge over defaultSettings (not just fall back to it) so a settings blob
// saved by an older build - missing a field added since - still comes out
// as a complete, safe-to-read Settings object instead of crashing whatever
// page first reads the missing field.
function readSettings(): Settings {
  return { ...defaultSettings, ...readJSON(KEYS.settings, defaultSettings) };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(readSettings);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === KEYS.settings) setSettings(readSettings());
    };
    window.addEventListener("ms-storage", handler);
    return () => window.removeEventListener("ms-storage", handler);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...readSettings(), ...patch };
    writeJSON(KEYS.settings, next);
    setSettings(next);
  }, []);

  return { settings, update };
}

/**
 * Work-in-progress form state for one module, so a session interrupted
 * partway through is not simply lost.
 *
 * Drafts stay on the device rather than joining SYNCED_KEYS: they change on
 * every keystroke, and pushing each one to the cloud would mean a network
 * write per character. They are also intentionally kept out of the training
 * database until the practice is completed - a half-written thought is not a
 * result, and letting it in would distort the event grouping and the
 * effectiveness figures.
 */
export function useDraft<T extends object>(moduleId: string) {
  const read = useCallback(
    () => readJSON<Record<string, { updatedAt: number; data: T }>>(KEYS.drafts, {}),
    [],
  );
  const [draft, setDraft] = useState<{ updatedAt: number; data: T } | null>(
    () => read()[moduleId] ?? null,
  );

  const save = useCallback(
    (data: T) => {
      const all = read();
      all[moduleId] = { updatedAt: Date.now(), data };
      // Written directly rather than through writeJSON: the "ms-storage"
      // event it broadcasts drives cloud sync and list re-reads, neither of
      // which should fire on every keystroke.
      localStorage.setItem(KEYS.drafts, JSON.stringify(all));
    },
    [moduleId, read],
  );

  const clear = useCallback(() => {
    const all = read();
    delete all[moduleId];
    localStorage.setItem(KEYS.drafts, JSON.stringify(all));
    setDraft(null);
  }, [moduleId, read]);

  /** Dismiss the resume prompt without deleting what is stored. */
  const dismiss = useCallback(() => setDraft(null), []);

  return { draft, save, clear, dismiss };
}

export function useUnlockedBadges() {
  return useStoredList<string>(KEYS.badges);
}

export function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function isWithinLastDays(timestamp: number, days: number) {
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}
