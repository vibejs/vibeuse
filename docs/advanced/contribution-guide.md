# Contribution Guide

Use pnpm and a supported Node version. Work on a focused local branch and use Conventional Commits. Add a Changeset for public behavior. Never add attribution trailers to commits. Run the full check before merging to main.

Add tests for public behavior, teardown, missing capabilities and reactive input replacement. Add a catalog entry and executable demo when adding a function. Run pnpm docs:generate after changing public declarations.

For local framework development, VIBEUSE_UI_SOURCE may select a neighboring built ui/index.js during Vitest runs. See README for the exact command. This does not change the published manifest. Do not publish, push, deploy or create remote resources during local development.
