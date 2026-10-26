# VibeUse

**Essential Composables for Vibe.js**

42 native, typed composables for local reactivity, browser APIs, storage, elements, sensors and scheduling. One ESM package, no runtime dependencies, and automatic effect-scope cleanup.

```sh
pnpm add @usevibejs/use @usevibejs/ui@^0.1.0
```

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';
import { useDebounce, useClipboard } from '@usevibejs/use';
const query = ref('');
const { value: search } = useDebounce(query, 250);
const { copy, copied } = useClipboard();
</script>

<template>
  <label>Search <input v-model="query" /></label>
  <p>{{ search }}</p>
  <button type="button" @click="copy(search)">{{ copied ? 'Copied' : 'Copy search' }}</button>
</template>
```

The supported framework peer range is `@usevibejs/ui ^0.1.0`. VibeUse versions independently. This is local release development; no package has been published by this work.

## Collection

| Category | Composables |
| --- | --- |
| Reactivity | useDebounce, useDebounceFn, useThrottle, useThrottleFn, usePrevious, useCounter, useToggle, useCycle, useEventBus, useRefHistory |
| Browser | useEventListener, useWindowSize, useMediaQuery, usePreferredDark, useDark, useDocumentVisibility, useOnline, useClipboard, useTitle, useFavicon, usePermission, useSupported |
| Storage | useStorage, useLocalStorage, useSessionStorage |
| Elements | useElementSize, useElementBounding, useIntersectionObserver, useResizeObserver, useMutationObserver, useScroll, useFocus, useClickOutside |
| Sensors | useMouse, useMouseInElement, useKeyModifier, useKeyPressed, useDevicePixelRatio |
| Timers | useIntervalFn, useTimeoutFn, useRafFn, useIdleCallback |

Imports are available from the root and `/reactivity`, `/browser`, `/storage`, `/elements`, `/sensors`, `/timers`. There are no unsupported function subpaths.

## Contracts

- Read inputs use Vibe.js `MaybeRefOrGetter`. Plain values, refs, shallow refs, computed refs and getters track through public Vibe.js APIs. Callbacks remain callbacks.
- Every resource owner returns a terminal, idempotent `stop()`. An active effect scope owns it automatically. Outside a scope, call `stop()` yourself. Pure state utilities need no cleanup.
- History requires an explicit `clone` strategy and a writable ref. No implicit JSON cloning.
- Buses are isolated per call. Share a returned bus explicitly or through public provide/inject.
- Storage persists replacement; use `data.value = newValue` or call `write()` after a nested mutation. Defaults do not overwrite stored values. `undefined` removes a key; `null` persists as JSON null. Never put secrets in browser storage.
- Dark mode changes no element without an explicit target. Persistence is opt-in. Title and favicon calls explicitly request document changes and restore prior state by default.
- Clipboard reports success only after the native write resolves. Permissions are queried, never requested.
- Missing browser APIs produce safe fallback state or inactive controllers. Module imports are safe without browser globals; full SSR/hydration integration is not claimed.

Each function has a [reference page](docs/functions) covering signature, options, return values, cleanup and limitations. See the [lifecycle guide](docs/guide/lifecycle.md) and [architecture decision](docs/decisions/0001-native-runtime.md).

## Local development

Use Node `^24.15.0 || >=26` and pnpm 11.18.0.

```sh
pnpm install
pnpm build:library
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm test:browser
pnpm test:package
pnpm bench
# Full verification:
pnpm check
# Documentation and interactive examples:
pnpm dev
```

Playwright needs a Chromium installation (`pnpm exec playwright install chromium` if absent). The site runs locally; no deployment is required. It contains a live demo for every function and a separate production component integration fixture. The library build uses stable TypeScript 7.0; `.vibe` template checks use the ecosystem's separate 7.1 content-mapper nightly.

To verify against a neighboring **built** Vibe.js checkout without changing package manifests or lockfiles:

```sh
VIBEUSE_UI_SOURCE=../vibejs/packages/ui/dist/index.js pnpm test
```

Normal development resolves the published `@usevibejs/ui@0.1.0`. The local override affects only Vitest's public-entry resolution; it never ships. No neighboring repository is modified.

`pnpm docs:generate` rebuilds public declarations, reference signatures and typed example fixtures. `pnpm typecheck` checks for sample drift and compiles guide `.vibe` snippets. `pnpm test:package` resolves a separate consumer lockfile and prefetches its exact dependencies using an explicitly selected pnpm store, installs the packed artifact in frozen offline mode, verifies all exports, checks strict NodeNext consumer types and measures actual production tree shaking with the peer external. Resolution and prefetch need registry access; the subsequent installation is offline. The consumer has its own manifest, lockfile and node_modules outside the workspace. `pnpm bench` records repeatable workloads with their environment. Reports and screenshots are written under `artifacts/`; coverage is under `coverage/`.

[GitHub CI](https://github.com/vibejs/vibeuse/actions/workflows/ci.yml) runs the complete gate on main pushes and pull requests using Node 24 and the pinned pnpm version. It installs Chromium, validates the packed consumer and uploads coverage, browser, bundle and benchmark reports. The workflow does not publish packages or deploy the documentation.

## Boundaries and limitations

Vibecn remains an optional UI layer; see [integration guidance](docs/advanced/integrating-with-vibecn.md). VibeUse does not implement query caching, form state, routing or advanced animation.

Scroll boundaries currently assume normal LTR, non-reversed coordinates. Content-only extent changes require `measure()`. Mouse APIs track mouse events and CSS-pixel coordinates, without touch or pen modes. Observer options are fixed per call. Missing idle callbacks have no fabricated fallback. Browser clipboard, permission and storage restrictions still apply. Element measurements update on observed size/scroll/resize; unrelated positional changes require `update()`.

Changesets manage independent releases. Use Conventional Commits and run `pnpm check` before merging. Do not publish, push, deploy or create remote resources as part of local development.

MIT · [Third-party notices](THIRD-PARTY-NOTICES.md)
