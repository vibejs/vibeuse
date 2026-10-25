# usePermission

Query and observe permission state without requesting access.

[Open the interactive .vibe example](#/functions/usePermission)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { usePermission } from '@usevibejs/use';

const permission = usePermission({ name: 'geolocation' });
```

## Signature

Generated from the built public declarations.

```ts
declare function usePermission(descriptor: PermissionDescriptor, options?: {
  navigator?: Navigator;
}): {
  state: Readonly<import("@usevibejs/ui").ShallowRef<"unknown" | "unsupported" | PermissionState, "unknown" | "unsupported" | PermissionState>>;
  error: Readonly<import("@usevibejs/ui").ShallowRef<unknown, unknown>>;
  isSupported: boolean;
  query: () => Promise<void>;
} & {
  stop(): void;
};
```

## Options

Native PermissionDescriptor and optional navigator. Query starts immediately; query() refreshes it.

## Return values

Readonly state (prompt | granted | denied | unknown | unsupported), error; isSupported; query(), stop().

## Browser compatibility and limitations

Unsupported permissions API yields unsupported. A rejected descriptor query yields unknown plus error, not denied. Permission names vary by browser. No sensitive permission is requested.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
