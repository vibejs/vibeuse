# Custom Composables

Compose behavior using native public refs, computed and scope cleanup. Return a stop operation for work that can be allocated outside a component. Keep callbacks distinct from reactive getters. Do not reach into Vibe.js internals.

A composable can call VibeUse utilities directly; each child scope belongs to the active parent. Avoid returning only a child ref and discarding the child's cleanup controls if the parent can run without a scope.
