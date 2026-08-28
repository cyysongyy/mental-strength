import type { FontScale } from "../types";
import { KEYS, readJSON } from "./storage";

/**
 * Text size is applied by scaling the root font size rather than by swapping
 * Tailwind text-* classes across the app. Every size in this codebase is
 * expressed in rem (Tailwind's default), so scaling the root moves padding,
 * gaps, icon boxes and line boxes together with the text - which is what
 * keeps a 130% setting readable instead of producing large type crammed into
 * unchanged boxes.
 */
export const FONT_SCALES: { id: FontScale; label: string; percent: number }[] = [
  { id: "standard", label: "標準", percent: 100 },
  { id: "large", label: "大", percent: 115 },
  { id: "xlarge", label: "特大", percent: 130 },
];

export const DEFAULT_FONT_SCALE: FontScale = "standard";

export function fontScalePercent(scale: FontScale): number {
  return FONT_SCALES.find((s) => s.id === scale)?.percent ?? 100;
}

export function applyFontScale(scale: FontScale) {
  // Percentage rather than a px value, so a reader who has raised the default
  // text size in their browser or OS keeps that adjustment and this setting
  // multiplies it instead of overwriting it.
  document.documentElement.style.fontSize = `${fontScalePercent(scale)}%`;
}

/**
 * Read straight from storage so the scale can be applied before React mounts.
 * Going through useSettings would mean the first paint is always at 100% and
 * then jumps - most visible to exactly the people who need the large setting.
 */
export function readStoredFontScale(): FontScale {
  const stored = readJSON<{ fontScale?: FontScale }>(KEYS.settings, {});
  const scale = stored.fontScale;
  return FONT_SCALES.some((s) => s.id === scale) ? (scale as FontScale) : DEFAULT_FONT_SCALE;
}
