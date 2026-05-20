# Contributing

Thanks for your interest in improving the template. Read this before opening a PR.

## Development workflow

1. **Fork + branch.** Work on a topic branch — never push directly to `main`.
2. **Install** — `npm ci && npx playwright install --with-deps chromium`.
3. **Make changes.** Keep PRs scoped — one concern per PR.
4. **Run checks locally:**
   ```bash
   npm run typecheck
   npm run lint
   npm run format:check
   npm run test:smoke
   ```
   Pre-commit hooks (husky + lint-staged) run automatically on `git commit`.
5. **Open a PR** against `main`. Fill in the PR template.

## Coding standards

Read [`CLAUDE.md`](CLAUDE.md) — it documents every rule that the agent (and reviewers)
enforce. The short version:

- **Selectors:** semantic only — `getByRole`, `getByLabel`, `getByTestId`. No CSS classes, no XPath.
- **Waits:** never `waitForTimeout`. Use `waitFor`, `waitForURL`, `waitForResponse`, or `expect.poll`.
- **POMs:** private locators, no `expect()` calls inside, methods named for user intent.
- **Tests:** tag every test (`@smoke`, `@regression`, `@api`, `@a11y`, `@visual`). Tests are
  independent — each creates its own data.
- **Credentials:** read from `process.env.*` only.

## Test data

- Static fixtures live in `test-data/*.json` — validated by zod at module load
  (`src/utils/testData.ts`). Adding fields means updating both the JSON and its schema.
- For per-test variable data, use the factories in `src/factories/`. They wrap `random.ts`
  to produce isolated, typed inputs.

## Adding a test type

If you're adding a new test layer (e.g. performance, contract), follow the existing pattern:

1. Add a tag (`@perf`).
2. Create `tests/<layer>/` and document its purpose.
3. Add an npm script (`test:<layer>`).
4. Update CI to run it on the right cadence.
5. Update `CLAUDE.md` and `README.md`.

## Visual baselines

Generated per-browser-per-OS. See [`tests/visual/README.md`](tests/visual/README.md) for
the convention. Always review diffs before updating baselines.

## Reporting issues

- **Bugs**: open an issue with steps to reproduce, expected vs actual, and the Playwright
  HTML report if relevant.
- **Security vulnerabilities**: read [`SECURITY.md`](SECURITY.md) — do not file public
  issues for vulnerabilities.

## License

By contributing, you agree your contributions are licensed under the project's
[MIT license](LICENSE).
