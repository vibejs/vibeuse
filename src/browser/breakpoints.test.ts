import { expect, it, vi } from 'vitest';
import { effectScope, ref } from '@usevibejs/ui';
import { useBreakpoints } from './breakpoints.ts';
import { mediaMock } from '../../test/browser-mocks.ts';

it('follows min-width queries, replacement, helpers and stop', () => {
  const { queries } = mediaMock();
  const map = ref<Record<string, number>>({ md: 800, sm: 400, bad: Number.NaN, big: Infinity });
  const points = useBreakpoints(map, { fallback: ['missing'] });
  expect(queries).toHaveLength(2);
  expect(points.isSupported).toBe(true);
  expect(points.current.value).toBeUndefined();
  expect(points.matches('sm')).toBe(false);
  expect(points.greater('nope')).toBe(false);
  expect(points.smaller('nope')).toBe(false);
  expect(points.smaller('sm')).toBe(true);
  expect(points.between('missing', 'sm')).toBe(false);
  queries[0]!.change(true);
  expect(points.active.value).toEqual(['sm']);
  expect(points.current.value).toBe('sm');
  expect(points.greater('sm')).toBe(false);
  expect(points.smaller('md')).toBe(true);
  expect(points.between('sm', 'md')).toBe(true);
  queries[1]!.change(true);
  expect(points.active.value).toEqual(['sm', 'md']);
  expect(points.current.value).toBe('md');
  expect(points.greater('sm')).toBe(true);
  expect(points.greater('md')).toBe(false);
  expect(points.smaller('md')).toBe(false);
  expect(points.between('sm', 'lg')).toBe(false);
  map.value = { sm: 400, lg: 1200 };
  expect(points.active.value).toEqual([]);
  queries[0]!.change(true);
  expect(points.active.value).toEqual([]);
  queries[2]!.change(true);
  expect(points.current.value).toBe('sm');
  queries[3]!.change(true);
  expect(points.current.value).toBe('lg');
  expect(points.between('sm', 'lg')).toBe(false);
  queries[3]!.change(false);
  expect(points.smaller('lg')).toBe(true);
  expect(points.between('sm', 'lg')).toBe(true);
  map.value = {};
  expect(points.current.value).toBeUndefined();
  points.stop();
  queries[2]!.change(true);
  expect(points.active.value).toEqual([]);
});

it('orders equal widths by name and uses a caller window', () => {
  const seen: string[] = [];
  const lists: Array<{
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  }> = [];
  const win = {
    matchMedia(query: string) {
      seen.push(query);
      const list = {
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      lists.push(list);
      return list as unknown as MediaQueryList;
    },
  } as unknown as Window;
  vi.stubGlobal('matchMedia', () => {
    throw new Error('global matchMedia');
  });
  const points = useBreakpoints({ b: 10, a: 10, bad: 'x' as unknown as number }, { window: win });
  expect(seen).toEqual(['(min-width: 10px)', '(min-width: 10px)']);
  expect(points.active.value).toEqual(['a', 'b']);
  expect(points.current.value).toBe('b');
  expect(points.greater('a')).toBe(true);
  points.stop();
  expect(lists[0]!.removeEventListener).toHaveBeenCalledOnce();
});

it('keeps the fallback when matchMedia is missing and drops names outside the map', () => {
  vi.stubGlobal('matchMedia', undefined);
  const scope = effectScope();
  const points = scope.run(() =>
    useBreakpoints({ b: 20, a: 10 }, { fallback: ['b', 'missing', 'a'] }),
  )!;
  expect(points.isSupported).toBe(false);
  expect(points.active.value).toEqual(['a', 'b']);
  expect(points.current.value).toBe('b');
  scope.stop();
  const empty = useBreakpoints({});
  expect(empty.active.value).toEqual([]);
  expect(empty.current.value).toBeUndefined();
  empty.stop();
});
