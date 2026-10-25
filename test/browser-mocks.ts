import { vi } from 'vitest';
export function mediaMock(initial = false) {
  const queries: Array<MediaQueryList & { change(value: boolean): void }> = [];
  const matchMedia = vi.fn((query: string) => {
    const target = new EventTarget();
    const media = Object.assign(target, {
      matches: initial,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      change(value: boolean) {
        media.matches = value;
        media.dispatchEvent(new Event('change'));
      },
    });
    queries.push(media);
    return media as unknown as MediaQueryList;
  });
  vi.stubGlobal('matchMedia', matchMedia);
  return { queries, matchMedia };
}
export function observerMock(name: 'ResizeObserver' | 'IntersectionObserver' | 'MutationObserver') {
  type Callback = (entries: never[], observer: never) => void;
  const instances: MockObserver[] = [];
  class MockObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    takeRecords = () => [];
    constructor(readonly callback: Callback) {
      instances.push(this);
    }
    fire(entries: unknown[] = []) {
      this.callback(entries as never[], this as never);
    }
  }
  vi.stubGlobal(name, MockObserver);
  return instances;
}
