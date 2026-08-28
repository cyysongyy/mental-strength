/**
 * Crisis detection and support resources.
 *
 * This app is self-help, not treatment. Someone in real danger needs a human,
 * not a training exercise - so any text that reads as self-harm or suicidal
 * intent must surface help immediately, in the same screen the person is
 * already looking at.
 *
 * The bias is deliberately toward showing: a false positive costs a dismissible
 * card, a false negative costs far more. The card is therefore written to be
 * warm and easy to dismiss, so over-triggering stays harmless rather than
 * alarming or accusatory.
 */

const RISK_PHRASES = [
  // Suicidal intent
  "自殺",
  "想死",
  "不想活",
  "活不下去",
  "活不下來",
  "結束生命",
  "結束自己",
  "輕生",
  "了斷",
  "一了百了",
  "死了算了",
  "死掉算了",
  "消失比較好",
  "不想再活",
  "沒有活下去",
  "活著沒意義",
  "活著好累",
  // Self-harm
  "自殘",
  "自傷",
  "傷害自己",
  "割腕",
  "跳樓",
  "燒炭",
  "上吊",
  "吞藥",
  // English. Inflected forms are listed explicitly ("killing" as well as
  // "kill") because plain substring matching does not stem.
  "suicide",
  "suicidal",
  "kill myself",
  "killing myself",
  "end my life",
  "ending my life",
  "end it all",
  "want to die",
  "wanna die",
  "don't want to live",
  "dont want to live",
  "no reason to live",
  "self-harm",
  "self harm",
  "hurt myself",
  "hurting myself",
  "harm myself",
  "harming myself",
  "cut myself",
  "cutting myself",
];

export function detectsCrisis(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return RISK_PHRASES.some((p) => normalized.includes(p.toLowerCase()));
}

export interface CrisisResource {
  name: string;
  number: string;
  note: string;
}

/**
 * Taiwan hotlines - the app is Traditional Chinese and aimed at Taiwan, so the
 * UI states that explicitly rather than implying these work everywhere.
 */
export const CRISIS_RESOURCES: CrisisResource[] = [
  { name: "安心專線", number: "1925", note: "衛福部・24 小時免費" },
  { name: "生命線", number: "1995", note: "24 小時協談" },
  { name: "張老師", number: "1980", note: "輔導專線" },
  { name: "緊急救護", number: "119", note: "立即的生命危險" },
];

export const NOT_MEDICAL_DISCLAIMER =
  "本 App 提供的是自我照顧與心理素質練習，不是醫療診斷或治療，也無法取代專業人員的協助。如果你的狀況持續影響生活，請尋求身心科、諮商心理師或臨床心理師的協助。";
