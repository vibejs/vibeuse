# Framework Compatibility

The supported peer range is @usevibejs/ui ^0.1.0. VibeUse versions independently. The playground compiler and runtime must match each other, as required by vibe.js.

Only public exports are consumed. VibeUse never imports ui/internal or ui/tooling. The vibe.js compiler may generate its own runtime ABI imports when compiling .vibe components.

The framework currently targets client rendering. Non-browser imports and documented fallback values are tested, but full SSR and hydration integration are not claimed.
