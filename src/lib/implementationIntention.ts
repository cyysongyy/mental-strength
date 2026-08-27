export function formatImplementationIntention(
  situation: string,
  action: string,
): string | undefined {
  if (!situation.trim() && !action.trim()) return undefined;
  return `如果${situation.trim()}，我就${action.trim()}`;
}
