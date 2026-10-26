# VibeUse delivery report

Implementation and completion audit finished on 2026-10-26. All 42 requested functions are implemented, typed, tested and demonstrated. No placeholder exports remain. The audit corrected throttle cooldowns after trailing calls and physical key release when modifiers change, with regression tests. A subsequent user request authorized creating the public GitHub repository vibejs/vibeuse and pushing main. No npm packages were published or services deployed.

## Repository structure

```text
vibeuse/
  src/
    index.ts
    core/             Framework-independent numeric helpers
    shared/           Private scope ownership and lazy environment access
    reactivity/       Filters, state, isolated buses, bounded history
    browser/          Events, browser state, document controls, capabilities
    storage/          Typed reactive persistence
    elements/         Observers, measurements, focus, outside clicks, scroll
    sensors/          Mouse, keyboard, density
    timers/           Interval, timeout, RAF, idle scheduling
  test/               API type tests, generated documentation type tests, fixtures
  examples/playground/  Real .vibe documentation application and integration fixture
  docs/               42 function pages, 20 guide pages, architecture decision
  scripts/            Documentation, browser, package and release verification
  benchmarks/         Reproducible diagnostic workloads
  .changeset/         Independent release configuration and initial changeset
  .github/workflows/ci.yml  Automated full verification and report artifacts
```

## Implemented collection

| Category | Composables |
| --- | --- |
| Reactivity | useDebounce, useDebounceFn, useThrottle, useThrottleFn, usePrevious, useCounter, useToggle, useCycle, useEventBus, useRefHistory |
| Browser | useEventListener, useWindowSize, useMediaQuery, usePreferredDark, useDark, useDocumentVisibility, useOnline, useClipboard, useTitle, useFavicon, usePermission, useSupported |
| Storage | useStorage, useLocalStorage, useSessionStorage |
| Elements | useElementSize, useElementBounding, useIntersectionObserver, useResizeObserver, useMutationObserver, useScroll, useFocus, useClickOutside |
| Sensors | useMouse, useMouseInElement, useKeyModifier, useKeyPressed, useDevicePixelRatio |
| Timers | useIntervalFn, useTimeoutFn, useRafFn, useIdleCallback |

Permission and support utilities are organized under Browser, making that category 12 functions.

## Package and exports

Package: @usevibejs/use, version 0.1.0, MIT, ESM, sideEffects false. Required peer: @usevibejs/ui ^0.1.0. Zero runtime dependencies. Versions are independent from Vibe.js.

- @usevibejs/use
- @usevibejs/use/reactivity
- @usevibejs/use/browser
- @usevibejs/use/storage
- @usevibejs/use/elements
- @usevibejs/use/sensors
- @usevibejs/use/timers

Every entry was imported from a packed tarball installed into a separate consumer with its own manifest, lockfile and node_modules. Exact consumer dependencies are resolved into a lockfile and prefetched into an explicitly selected pnpm store first; the subsequent installation uses frozen offline mode. The store selection is asserted to match the installed workspace's cache, preventing temporary-directory filesystem placement from selecting an empty store. No existing registry metadata is required. Strict NodeNext type checking passed with skipLibCheck false. No local filesystem dependencies are published.

## Reactive architecture and ownership

Read inputs use Vibe.js public MaybeRefOrGetter and toValue. Watchers and derived state are native Vibe.js APIs. Writable history sources reject readonly refs and computed refs in declaration tests and guard readonly sources at runtime. History requires an explicit clone strategy. Buses are isolated per call and can be shared explicitly.

Each resource owner creates a native child effectScope. Watchers and nested composables belong to it; onScopeDispose releases native resources. stop() is idempotent and terminal. Outside a scope, callers must retain and call stop(). Pure counter, toggle, cycle and support checks allocate no external resources. Async clipboard/permission results use request generations and disposal guards. Stale observer target callbacks are rejected.

No runtime source imports ui/internal, ui/tooling, compiler internals or another UI framework. Neighboring repositories were inspected without modification. Vitest additionally passed against the neighboring Vibe.js built public runtime using the documented environment override.

## Actual verification results

| Check | Result |
| --- | --- |
| pnpm install --frozen-lockfile | Passed |
| pnpm typecheck | Strict library, scripts, benchmarks, .vibe templates and documentation checks passed |
| pnpm lint / pnpm fmt:check | Passed without warnings |
| pnpm test / test:coverage | 73 tests across 8 files passed |
| Runtime coverage | Statements 100%, branches 100%, functions 100%, lines 100% |
| Coverage enforcement | 100% per file, no coverage ignores |
| pnpm build | Library declarations, source maps and production site passed; no tracked build diff |
| pnpm test:browser | 22 browser check groups passed in Chromium 156.0.8078.4; no page errors |
| pnpm test:package | Offline tarball install, every export, strict external types, tree shaking passed |
| pnpm check | Complete gate passed |
| Neighboring Vibe.js runtime | All 73 tests passed |
| pnpm peers check | No peer dependency issues |

Coverage counts: 825/825 statements, 526/526 branches, 243/243 functions, 721/721 lines. Four barrel-only files contain no executable behavior.

The CI workflow runs the same complete gate on main pushes and pull requests, using Node 24, locked pnpm dependencies and Chromium on Ubuntu. Action revisions are pinned, repository permissions are read-only and verification reports are uploaded as artifacts. CI has no publishing or deployment steps.

Browser checks cover all 42 demos, clipboard writes, responsive media/window state, local-storage reload persistence, element resizing, intersections, two-axis scrolling, focus, outside pointers, mouse coordinates, keyboard release and timer controls. Instrumented native resources show no growth after 18 route teardown cycles. Two independent applications pass 30 app teardown cycles with zero remaining global listeners, observers or intervals. Unit tests additionally exercise unavailable APIs, rejected async operations, corrupted/quota-denied storage, explicit scopes, late targets, replacement and stale callbacks.

Reports: [coverage](coverage/coverage-summary.json), [browser](artifacts/browser-report.json), [package](artifacts/package-report.json), [benchmarks](artifacts/benchmark.json).

## Production measurements

| Artifact | Bytes | Gzip bytes |
| --- | ---: | ---: |
| useCounter, root import, minified ESM with peer external | 948 | 460 |
| All 42 composables, minified ESM with peer external | 24652 | 6772 |
| Packed npm tarball, including declarations and maps | 34508 | — |
| All emitted library JS files, before consumer minification | 38615 | — |

Root and category useCounter builds produce identical code. Unrelated clipboard, storage and observer code is absent from the single-function bundle. The framework remains external; the consumer resolves its own peer runtime.

The production documentation assets are separate from library measurements:

- integration-BNIlX33Y.js: 1754 bytes
- main-Bep0GJnT.js: 176342 bytes
- main-C3W5xGQz.css: 9764 bytes
- timers-DBfYKC3p.js: 37249 bytes

Benchmarks used v24.22.1 on darwin/arm64, three warmup runs and one measured run. These are local diagnostics, not cross-framework comparisons or browser-layout benchmarks.

| Workload | Iterations | Measured duration |
| --- | ---: | ---: |
| synchronous updates with previous-value tracking | 100000 | 8.773 ms |
| native EventTarget event delivery | 100000 | 1.629 ms |
| scope creation/disposal with listener and bounded history | 10000 | 10.562 ms |

## Examples and documentation

Run pnpm dev for the responsive documentation/playground. Every function has a real interactive .vibe demo, generated declaration signature, options, returned values, cleanup contract and limitations. The searchable index supports category filtering. Light and dark themes use an explicit document target. Copy controls use the implemented clipboard API. Source examples and guide components are type-checked; every playground component is compiled as part of verification.

The collection includes the required clipboard, dark mode, breakpoint, window-size, local preferences, debounce, throttle, undo/redo, keyboard, resize, intersection, scroll progress, outside dropdown, mouse, timer and capability examples. The separate integration.html fixture verifies independent applications and actual element mounting/unmounting.

Vibecn integration is documented as an optional UI composition. No Vibecn component was duplicated, no Vibecn runtime dependency was added, and no neighboring repository was edited.

## Known limitations

- Browser integration was executed in Chromium; Safari and Firefox were not executed in this environment. Capability flags and missing-API behavior are tested.
- The framework targets client rendering. Safe Node imports and fallback values are tested; full SSR/hydration support is not claimed.
- Storage persists replacements. For nested mutations call write(). Same-tab instances are independent; share one store for same-tab synchronization. Default JSON parsing is not schema validation.
- Scroll boundaries assume normal LTR, non-reversed coordinates. Content-only scroll-extent changes need measure().
- Mouse APIs track mouse events in CSS pixels. Relative coordinates use the transformed border-box rectangle rather than inverse local transforms.
- Bounding measurements need update() for position-only changes without scroll/resize. Observer configuration is fixed per call.
- Clipboard and permission policies vary by browser. Unsupported idle callbacks stay inactive without a fabricated fallback.
- Concurrent title, favicon or dark-class owners should be avoided. Outside a scope, explicit stop() remains the caller's responsibility.
- Template checking uses the ecosystem's pinned TypeScript 7.1 content-mapper nightly; library declarations use TypeScript 7.0.2. tsdown emits a nonfatal native-compiler experimental-API warning.

## Local commits

| Commit | Content |
| --- | --- |
| ce2b72c | Package/tooling scaffold |
| ec6d5ed | All 42 composables and runtime/type tests |
| cc467e1 | Documentation, real demos, benchmarks and package/browser verification |
| e8a9d92 | Completed feature branch merged into main |

This delivery report was committed separately and merged into main. Commit email metadata was changed to the author’s GitHub noreply address before publication to preserve email privacy; code and commit messages were preserved. The origin remote is https://github.com/vibejs/vibeuse.git. The final main hash is supplied in the delivery response.
