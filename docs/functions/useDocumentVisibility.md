# useDocumentVisibility

Read whether the document is currently visible.

[Open the interactive .vibe example](#/functions/useDocumentVisibility)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useDocumentVisibility } from '@usevibejs/use';

const { visibility, stop } = useDocumentVisibility();
```

## Signature

Generated from the built public declarations.

```ts
declare function useDocumentVisibility(doc?: Document | undefined): {
  visibility: Readonly<import("@usevibejs/ui").ShallowRef<DocumentVisibilityState, DocumentVisibilityState>>;
} & {
  stop(): void;
};
```

## Options

Optional Document argument. The non-browser fallback is visible.

## Return values

Readonly visibility (visible | hidden); stop().

## Browser compatibility and limitations

A visibility flag is not a guarantee that the user is looking at the page.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
