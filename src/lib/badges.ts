import type { BadgeDef, CheckIn, ModuleLogEntry } from "../types";

export const BADGES: BadgeDef[] = [
  {
    id: "first-checkin",
    name: "第一步",
    description: "完成第一次每日心境快測",
    icon: "🌱",
  },
  {
    id: "streak-3",
    name: "穩定練習者",
    description: "連續打卡 3 天",
    icon: "🔥",
  },
  {
    id: "streak-7",
    name: "習慣養成中",
    description: "連續打卡 7 天",
    icon: "🏆",
  },
  {
    id: "reframe-5",
    name: "思維重構師",
    description: "完成 5 次認知重構練習",
    icon: "🧠",
  },
  {
    id: "circles-5",
    name: "目標掌控者",
    description: "完成 5 次目標控制練習",
    icon: "🎯",
  },
  {
    id: "tolerance-focus",
    name: "專注覺察者",
    description: "完成 5 次情緒耐受挑戰",
    icon: "⏱️",
  },
  {
    id: "sos-user",
    name: "冷靜急救員",
    description: "使用過 3 次 SOS 應急工具",
    icon: "🫁",
  },
  {
    id: "all-rounder",
    name: "全方位鍛鍊者",
    description: "四大模組都至少練習過一次",
    icon: "⭐",
  },
];

export function computeStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  const dates = new Set(checkIns.map((c) => c.date));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function computeUnlockedBadges(
  checkIns: CheckIn[],
  logs: ModuleLogEntry[],
): string[] {
  const unlocked = new Set<string>();
  if (checkIns.length >= 1) unlocked.add("first-checkin");
  const streak = computeStreak(checkIns);
  if (streak >= 3) unlocked.add("streak-3");
  if (streak >= 7) unlocked.add("streak-7");

  const counts: Record<string, number> = {};
  for (const log of logs) counts[log.type] = (counts[log.type] ?? 0) + 1;

  if ((counts.reframe ?? 0) >= 5) unlocked.add("reframe-5");
  if ((counts.circles ?? 0) >= 5) unlocked.add("circles-5");
  if ((counts.tolerance ?? 0) >= 5) unlocked.add("tolerance-focus");
  if ((counts.sos ?? 0) >= 3) unlocked.add("sos-user");
  if (
    (counts.reframe ?? 0) > 0 &&
    (counts.circles ?? 0) > 0 &&
    (counts.tolerance ?? 0) > 0 &&
    (counts.sos ?? 0) > 0
  )
    unlocked.add("all-rounder");

  return Array.from(unlocked);
}
