# Integrating with Vibecn

Vibecn supplies UI components as .vibe source. VibeUse supplies behavior. Neither library requires the other. Install a Vibecn Button using its own documented installer, then import it from your application's component directory and bind VibeUse controls.

For example, a Button click can invoke useClipboard().copy(text), with its disabled state bound to isPending and its label derived from copied. A Switch can bind a deliberate local preference via an explicit setter. Keep UI markup and styling in Vibecn rather than copying it into VibeUse.

VibeQuery owns server state, VibeForm owns forms, VibeTable owns headless table logic, and VibeMotion owns advanced animations. VibeUse stays focused on small local and browser behaviors.
