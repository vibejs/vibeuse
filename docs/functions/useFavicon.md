# useFavicon

Apply a reactive favicon URL and restore prior document state.

[Open the interactive .vibe example](#/functions/useFavicon)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useFavicon } from '@usevibejs/use';

const icon = ref<string | null>('/icon.svg');
const { stop } = useFavicon(icon);
```

## Signature

Generated from the built public declarations.

```ts
declare function useFavicon(href: MaybeRefOrGetter<string | null>, options?: {
  document?: Document;
  rel?: string;
}): {
  stop(): void;
};
```

## Options

Optional document and rel (icon). Null clears the href attribute.

## Return values

stop() restores an existing link or removes a link created by this call.

## Browser compatibility and limitations

The call explicitly requests a document mutation. It owns the first matching rel link; avoid concurrent owners.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
