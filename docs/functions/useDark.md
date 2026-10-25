# useDark

Combine system preference, an explicit choice and opt-in persistence.

[Open the interactive .vibe example](#/functions/useDark)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useDark } from '@usevibejs/use';

const target = shallowRef<Element | null>(null);
const theme = useDark({ target, storageKey: 'app-theme' });
theme.set('auto');
theme.toggle();
```

## Signature

Generated from the built public declarations.

```ts
declare function useDark(options?: DarkOptions): {
  preference: import("@usevibejs/ui").ShallowRef<ColorPreference, ColorPreference>;
  isDark: import("@usevibejs/ui").ComputedRef<boolean>;
  error: Readonly<import("@usevibejs/ui").ShallowRef<unknown, unknown>> | undefined;
  set: (value: ColorPreference) => void;
  toggle: () => void;
} & {
  stop(): void;
};
```

## Options

initialValue is auto. target is opt-in; className defaults to dark. storageKey enables persistence. Optional storage and window are injectable.

## Return values

Writable preference (auto | light | dark), readonly computed isDark; set(), toggle(), stop(); optional storage error ref.

## Browser compatibility and limitations

No document is changed without an explicit target. Original class membership is restored on target replacement or disposal. Avoid multiple owners of the same class. Persistence errors retain in-memory control.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
