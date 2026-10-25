import { expect, it } from 'vitest';
import { clamp, delay } from './timing.ts';
it('normalizes finite delays without native integer overflow and handles invalid numbers', () => {
  expect(delay(-1)).toBe(0);
  expect(delay(5)).toBe(5);
  expect(delay(Infinity)).toBe(0);
  expect(delay(NaN)).toBe(0);
  expect(delay(3_000_000_000)).toBe(2_147_483_647);
  expect(clamp(3, 0, 2)).toBe(2);
});
