# TypeScript

The library uses strict TypeScript and emits public declarations for each entry. Type declaration tests check literal unions, nullability, callback arguments, typed DOM events, generic storage serializers and rejection of readonly history sources.

The library compiler is TypeScript 7.0.2. Real .vibe templates use the ecosystem's separate 7.1 content-mapper nightly with @usevibejs/language-tools. No wildcard module declaration bypasses template checking.

Returned readonly state is a TypeScript contract; the library does not add wrapper proxies merely to guard public state. Use explicit controls for updates.
