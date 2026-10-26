# VibeUse

- English only in code, documentation, messages and commits.
- Use only the public `@usevibejs/ui` runtime. Relative TypeScript imports end in `.ts`.
- Every resource-owning composable exposes `stop()` and is owned by its calling effect scope.
- Run `pnpm check` before merging local branches. Keep examples as genuine `.vibe` files.
- Keep the package independent from Vibecn and other state libraries.
- Releases go through changesets and .github/workflows/release.yml. Add a changeset for every user-visible change.
- Never publish packages, push, deploy, or create remote resources without an explicit release request.
- Never add Co-Authored-By, Signed-off-by, Generated-by, or AI attribution trailers to commits.
