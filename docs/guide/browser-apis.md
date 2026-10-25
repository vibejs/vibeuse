# Browser APIs

Browser globals are resolved when a function is called, never at module evaluation. Most APIs accept a window, document or navigator override for tests or another browsing context. Constructors for observers use the current realm. Missing native capabilities yield safe inactive controllers and capability flags.

Clipboard writes resolve asynchronously. A true result means the browser write resolved successfully; errors are available through error. Clipboard security and user-gesture requirements vary by browser. See [MDN writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).

Permission queries never request access. Unsupported permission descriptors can reject even when the Permissions API exists. unknown plus error is distinct from denied or unsupported. No polling is added for missing APIs.
