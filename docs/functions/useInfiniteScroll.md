# useInfiniteScroll

Load more content when a scroll edge is within a distance.

[Open the interactive .vibe example](#/functions/useInfiniteScroll)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useInfiniteScroll } from '@usevibejs/use';

const list = shallowRef<HTMLElement | null>(null);
const feed = useInfiniteScroll(list, () => {}, { distance: 80 });
```

## Signature

Generated from the built public declarations.

```ts
declare function useInfiniteScroll(target: EventTargetInput<Element | Window>, onLoadMore: () => void | Promise<void>, options?: InfiniteScrollOptions): {
  isLoading: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  error: Readonly<import("@usevibejs/ui").ShallowRef<unknown, unknown>>;
  check: () => void;
} & {
  stop(): void;
};
```

## Options

direction defaults to bottom. distance defaults to 0 CSS pixels. interval defaults to 0. canLoadMore gates a check. Optional window for resize.

## Return values

Readonly isLoading and error; check(), stop().

## Browser compatibility and limitations

One edge per call. A rejected loader is stored on error. Automatic follow-up loads run only when the scroll metrics change. The composable does not render or virtualize the list.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
