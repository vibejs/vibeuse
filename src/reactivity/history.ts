import { computed, isReadonly, shallowRef, watch } from '@usevibejs/ui';
import type { ComputedRef, Ref, WritableComputedRef } from '@usevibejs/ui';
import { resource } from '../shared/resource.ts';

export interface RefHistoryOptions<T> {
  /** Required: choose identity for immutable values, structuredClone for cloneable values, or a domain-specific copy. */
  clone: (value: T) => T;
  /** Maximum retained snapshots, including the current snapshot. */
  capacity?: number;
  deep?: boolean | number;
}
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Writable<R extends Ref> = R extends ComputedRef
  ? R extends WritableComputedRef<unknown>
    ? R
    : never
  : Equal<Pick<R, 'value'>, { -readonly [K in keyof Pick<R, 'value'>]: R[K] }> extends true
    ? R
    : never;
export function useRefHistory<R extends Ref>(
  source: R & Writable<R>,
  options: RefHistoryOptions<R['value']>,
) {
  type T = R['value'];
  if (isReadonly(source)) throw new TypeError('useRefHistory requires a writable ref.');
  const capacity = options.capacity ?? 100;
  if (!Number.isInteger(capacity) || capacity < 1)
    throw new RangeError('History capacity must be a positive integer.');
  return resource((_cleanup, alive) => {
    const snapshots = shallowRef<readonly T[]>([options.clone(source.value)]);
    const position = shallowRef(0);
    const isPaused = shallowRef(false);
    let restoring = false;
    const commit = () => {
      if (!alive() || restoring || isPaused.value) return;
      const next = [...snapshots.value.slice(0, position.value + 1), options.clone(source.value)];
      snapshots.value = next.slice(-capacity);
      position.value = snapshots.value.length - 1;
    };
    watch(source, commit, { flush: 'sync', deep: options.deep });
    const restore = (index: number) => {
      if (!alive() || index < 0 || index >= snapshots.value.length) return;
      restoring = true;
      try {
        source.value = options.clone(snapshots.value[index]);
        position.value = index;
      } finally {
        restoring = false;
      }
    };
    const clear = () => {
      if (alive()) {
        snapshots.value = [options.clone(source.value)];
        position.value = 0;
      }
    };
    return {
      history: snapshots as Readonly<typeof snapshots>,
      position: position as Readonly<typeof position>,
      canUndo: computed(() => position.value > 0),
      canRedo: computed(() => position.value < snapshots.value.length - 1),
      isPaused: isPaused as Readonly<typeof isPaused>,
      commit,
      clear,
      undo: () => restore(position.value - 1),
      redo: () => restore(position.value + 1),
      pause: () => {
        isPaused.value = true;
      },
      resume: () => {
        if (alive()) isPaused.value = false;
      },
    };
  });
}
