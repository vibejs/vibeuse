import { effectScope, onScopeDispose } from '@usevibejs/ui';

/** A private child scope owns watchers as well as nested composables. */
export function resource<T extends object>(
  setup: (cleanup: (fn: () => void) => void, alive: () => boolean) => T,
): T & { stop(): void } {
  const scope = effectScope();
  try {
    const result = scope.run(() => setup(onScopeDispose, () => scope.active));
    if (!result) throw new Error('VibeUse cannot allocate resources inside a stopped scope.');
    return Object.assign(result, { stop: () => scope.stop() });
  } catch (error) {
    scope.stop();
    throw error;
  }
}

export const defaultWindow = (): Window | undefined =>
  typeof window === 'undefined' ? undefined : window;
export const defaultDocument = (): Document | undefined => defaultWindow()?.document;
export const defaultNavigator = (): Navigator | undefined => defaultWindow()?.navigator;
export type ElementTarget<T extends Element = Element> = import('@usevibejs/ui').MaybeRefOrGetter<
  T | null | undefined
>;
