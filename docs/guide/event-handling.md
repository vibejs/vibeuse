# Event Handling

useEventListener accepts a nullable native target, a ref or a getter. It removes the old listener before adding one for a replacement. Capture options are retained so cleanup matches the native subscription. Native once and AbortSignal options keep their browser semantics.

useClickOutside observes primary pointer origins and keyboard-generated clicks. Exclusions can be reactive elements. It uses composed paths for shadow DOM and optionally observes outside focus. It does not interfere with native scrolling or suppress events.

useEventBus creates one isolated typed bus. Share the object explicitly; subscriptions belong to their subscribing effect scope. No names are resolved through a global map.
