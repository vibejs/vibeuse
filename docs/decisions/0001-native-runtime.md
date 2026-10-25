# Native runtime, ownership, and distribution

VibeUse consumes `@usevibejs/ui` 0.1.x through its public entry point. Inspection of Vibe.js's contracts, decision records, ref/computed/reactive implementations, runtime watchers, lifecycle hooks, effect scopes, injection, scheduler, component/tooling types, compiler and testing APIs established these constraints:

- `MaybeRefOrGetter` is the framework's input type. `toValue` invokes a getter; arbitrary callbacks remain callbacks.
- Watchers default to the pre queue. History and filters use sync watchers to observe individual writes. DOM target initialization uses the post queue, and explicit event subscriptions switch synchronously.
- Computed refs are lazy and are not scope-owned effects. VibeUse returns native computed refs for derived values, and stops watchers and external resources through child effect scopes.
- Each resource composable creates a child `effectScope()`. It works without a component instance, including in explicit scopes. Calling it outside any scope is allowed, but its returned `stop()` must be called. Inside a stopped scope, allocation throws.
- DOM refs can be null during setup and change after rendering. No component-only mount hook is required for allocation or cleanup. Public `onScopeDispose` owns native resources.
- Readonly computed values are read inputs. History rejects them, both in declaration tests and at runtime. Writable controls are explicit functions, or deliberately writable refs for storage and preferences.
- Storage uses replacement-based persistence by default. Avoiding implicit deep traversal keeps cost predictable and preserves serializer types. Object mutation requires replacing the value or calling `write()`.
- Buses are created per call. Applications share them explicitly, optionally with public provide/inject. There is no module-level event registry.
- Browser globals are read inside functions only. This makes imports safe in Node; it is not an SSR/hydration integration claim.
- One ESM package exposes verified category entries. The framework is always external. VibeUse has independent versioning and no runtime dependencies.

Vibecn was reviewed for `.vibe` distribution, template checking, accessible native controls and documentation navigation. It remains an optional UI layer; VibeUse does not copy its components or change its repository. VibeForm's distribution confirms the existing ecosystem's external-runtime package convention. Other state libraries are outside this project's responsibility.
