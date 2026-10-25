# Performance

The package is ESM with sideEffects false and category exports. @usevibejs/ui remains external. Build and package checks create real production bundles to compare a single function with the full entry; the measurements are written to artifacts/package-report.json.

No reactive engine, general animation engine or polling loop is included. Native events and observers perform browser tracking. DOM bounding reads happen only for requested measurements and their relevant events. Storage and filters do not implicitly traverse object graphs.

Run pnpm bench for reproducible reactive update, event-delivery and repeated scope lifecycle benchmarks. Results include the Node version, workload sizes and durations. They are diagnostics on the current machine, not claims about other frameworks or end-user devices.
