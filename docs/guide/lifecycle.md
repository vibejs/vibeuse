# Lifecycle

Resource-owning calls create a child effect scope. The parent may be a .vibe component setup, another composable or an explicit effectScope. Scope disposal stops watchers and queued jobs, disconnects observers and removes listeners. Async permission and clipboard results are ignored after disposal.

Every resource owner returns stop(). It is idempotent and terminal; start/resume cannot restart a stopped controller. Outside an active scope, retain the result and call stop() yourself. For application plugins, create an explicit scope and stop it with app.onUnmount. Calling inside an already stopped scope is rejected.

Scope pause affects reactive watchers according to vibe.js semantics. It does not pause external browser events or timers; use the composable's explicit pause/cancel controls.

Pure state utilities (counter, toggle, cycle and supported) allocate no external resources and need no stop.
