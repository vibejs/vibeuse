# Architecture

The public root re-exports six categories. src/core contains framework-independent numeric helpers; src/shared holds the private scope owner and lazy browser defaults. No shared module holds mutable application state.

Resource setup creates a native child effectScope. Watchers and nested composables join it; onScopeDispose owns native cleanup. stop() stops that entire subtree. Observer callbacks also guard against stale target delivery, and async permissions and clipboard results carry request generations.

Vibe.js 0.1.x public implementation and types were inspected before implementation. The decision record documents scheduler and scope semantics. The package intentionally avoids ui/internal, compiler internals and undocumented component instance state.
