# useTitle

Apply a reactive browser tab title.

[Open the interactive .vibe example](#/functions/useTitle)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useTitle } from '@usevibejs/use';

const title = ref('My application');
const { stop } = useTitle(title);
```

## Signature

Generated from the built public declarations.

```ts
declare function useTitle(title: MaybeRefOrGetter<string>, options?: {
  document?: Document;
  restoreOnStop?: boolean;
}): {
  stop(): void;
};
```

## Options

Optional document; restoreOnStop defaults to true.

## Return values

stop() stops the title watcher and restores the original title by default.

## Browser compatibility and limitations

The call explicitly requests a document mutation. Concurrent title owners should be avoided.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
