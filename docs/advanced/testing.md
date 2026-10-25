# Testing

Run pnpm install, pnpm typecheck, pnpm lint, pnpm test, pnpm test:coverage and pnpm build. pnpm test:browser checks actual .vibe production behavior in Chromium. pnpm test:package packs and installs a separate consumer, checks every public entry and measures tree shaking. pnpm check runs the complete gate.

Unit tests use real Vibe.js reactivity and deterministic browser API doubles, not a mocked reactive runtime. Node tests cover imports without browser globals. Browser tests cover actual layout, observers, scrolling, focus, storage and component mount/unmount.

Coverage reports include all runtime files, including category index implementations. Generated declarations and barrel-only files carry no executable behavior. Coverage is reported honestly; no ignore comments or skipped failing tests are used.
