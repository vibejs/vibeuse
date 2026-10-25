# Reactivity

VibeUse uses the refs, computed values, watchers and effect scopes exported by @usevibejs/ui. Returned state is native Vibe.js state. It works in templates and nested composables without adapters.

Filters and history observe individual writes synchronously. DOM measurements and observer target setup use the post queue so rendered refs are available. Event listeners follow target replacements synchronously. Vibe.js nextTick waits for queued effects when tests or code need the updated DOM.

Deep traversal is never enabled implicitly by a generic input. History offers an explicit deep option. Storage persists value replacement.
