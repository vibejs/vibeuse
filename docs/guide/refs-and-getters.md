# Refs and Getters

Read inputs use Vibe.js MaybeRefOrGetter. Plain values, Ref, ShallowRef, ComputedRef, writable computed refs and getters are accepted where a value input is supported. Getters are evaluated inside watchers or computed getters to preserve tracking.

Callbacks are separate parameters; useDebounceFn does not evaluate its callback as a getter. Put expensive reactive derivation in a framework computed if it should be shared.

Storage data and dark preference are deliberately writable. Other utility state is exposed as readonly TypeScript refs with explicit actions. History requires a writable source and rejects readonly computed refs.
