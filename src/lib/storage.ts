import { useCallback, useEffect, useState } from "react";
import type {
  CheckIn,
  ModuleLogEntry,
  Settings,
  WeeklyReport,
} from "../types";

const KEYS = {
  checkins: "ms.checkins.v1",
  logs: "ms.logs.v1",
  settings: "ms.settings.v1",
  reports: "ms.reports.v1",
  badges: "ms.badges.v1",
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ms-storage", { detail: { key } }));
}

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

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    readJSON(KEYS.settings, defaultSettings),
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === KEYS.settings)
        setSettings(readJSON(KEYS.settings, defaultSettings));
    };
    window.addEventListener("ms-storage", handler);
    return () => window.removeEventListener("ms-storage", handler);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...readJSON(KEYS.settings, defaultSettings), ...patch };
    writeJSON(KEYS.settings, next);
    setSettings(next);
  }, []);

  return { settings, update };
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
