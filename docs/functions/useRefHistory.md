# useRefHistory

Record bounded snapshots with undo and redo.

[Open the interactive .vibe example](#/functions/useRefHistory)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useRefHistory } from '@usevibejs/use';

const count = ref(0);
const history = useRefHistory(count, { clone: n => n, capacity: 50 });
count.value++;
history.undo();
history.redo();
```

## Signature

Generated from the built public declarations.

```ts
declare function useRefHistory<R extends Ref>(source: R & Writable<R>, options: RefHistoryOptions<R['value']>): {
  history: Readonly<import("@usevibejs/ui").ShallowRef<readonly R["value"][], readonly R["value"][]>>;
  position: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
  isPaused: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  commit: () => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  pause: () => void;
  resume: () => void;
} & {
  stop(): void;
};
```

## Options

clone(value) is required. capacity defaults to 100 and includes the current snapshot. deep defaults to false; true or a numeric depth explicitly enables traversal.

## Return values

Readonly history, position, canUndo, canRedo, isPaused; undo(), redo(), clear(), commit(), pause(), resume(), stop().

## Browser compatibility and limitations

Requires a writable ref. The clone strategy runs on recording and restoring; identity is suitable only for immutable values. clear() retains the current value as the sole snapshot.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
