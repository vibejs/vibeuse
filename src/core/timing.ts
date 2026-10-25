/** Normalize user-provided timer delays without overflowing native timer integers. */
export function delay(value: number): number {
  return Number.isFinite(value) ? Math.min(2_147_483_647, Math.max(0, value)) : 0;
}
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
