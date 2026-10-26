# Contributing

1. Use Node `^24.15.0 || >=26` and run `pnpm install`.
2. Run `pnpm check` before opening a pull request. It formats, type-checks, lints, tests with coverage, builds and runs the browser and packed-consumer checks. Install Chromium with `pnpm exec playwright install chromium` if it is missing.
3. Add a changeset with `pnpm changeset` for every user-visible change.
4. Write commit messages as [Conventional Commits](https://www.conventionalcommits.org/).

See the [contribution guide](docs/advanced/contribution-guide.md) for tests, documentation and examples.
