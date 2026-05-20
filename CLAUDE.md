# CLAUDE.md — Playwright QA Template

This file is the source of truth for Claude (and human reviewers) working in this repo.
It overrides any default agent behavior — read it before touching code.

## Project Summary

A lean, enterprise-grade QA automation template built on Playwright + TypeScript.
Designed to be cloned, owned, and adapted — not imported as a framework.

The template ships **wired against [saucedemo.com](https://www.saucedemo.com)** so it
works out of the box. To adopt it, point `BASE_URL` at your app and adapt the page
objects. See `TODO.md` for the checklist.

The project has **no runtime application code**. Every file is a test, a test helper, or
configuration. Claude's role is to write, fix, and maintain test code — never to build
product features.

---

## Architecture

### Layer model

```
tests/             ← assertions only — no implementation logic
src/pages/         ← Page Object Model: UI interactions per page
src/components/    ← sub-page objects: shared UI fragments (nav, modals, headers)
src/api/           ← typed REST wrappers with zod-validated response schemas
src/fixtures/      ← Playwright test extensions (auth, page objects, setup/teardown)
src/factories/     ← typed test-data factories built on random helpers
src/utils/         ← pure helpers: zod-validated JSON loader, random data
test-data/         ← static JSON payloads (zod-validated at module load)
docs/              ← guides not tied to a specific file (flake handling, etc.)
```

Tests call page objects and fixtures. **Tests never touch raw Playwright locators
directly** — except trivial one-off smoke tests where a POM is overkill.

### Test types and where they live

| Type             | Folder                 | Tag           | Run frequency           |
| ---------------- | ---------------------- | ------------- | ----------------------- |
| Critical path    | `tests/smoke/`         | `@smoke`      | Every push + PR         |
| Full coverage    | `tests/regression/`    | `@regression` | Nightly + push to main  |
| REST contracts   | `tests/api/`           | `@api`        | Every push + PR         |
| WCAG audits      | `tests/accessibility/` | `@a11y`       | Every PR + nightly      |
| Screenshot diffs | `tests/visual/`        | `@visual`     | Every PR (non-blocking) |
| Known flaky      | anywhere               | `@quarantine` | Non-blocking job        |

### Auth flow — worker-scoped

Authentication is handled by a **worker-scoped fixture** in
`src/fixtures/base.fixture.ts`. Each Playwright worker performs **one** login on first
use and writes its own storage state to `.auth/user-<workerIndex>.json` (gitignored;
wiped at the end of every CI run by `global.teardown.ts`).

- Tests within a worker share that session.
- Tests in **different** workers never share a session.
- Prevents per-user rate limit collisions, CSRF nonce rotation races, sticky session
  locks, and concurrent cart-state collisions on real apps.

Tests that need a fresh, logged-out context use the `freshContextPage` fixture — it
spawns a clean browser context with `storageState: undefined` and the project's
`baseURL`.

### Global setup & teardown

| File                              | When     | Responsibility                                                                                                                                    |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/fixtures/global.setup.ts`    | Pre-run  | Validate `BASE_URL` / `TEST_USER_USERNAME` / `TEST_USER_PASSWORD`; enforce URL shape; wipe stale `.auth/user-*.json` (skip with `PW_KEEP_AUTH=1`) |
| `src/fixtures/global.teardown.ts` | Post-run | Wipe **all** `.auth/*.json` in CI so saved sessions never persist into uploaded artifacts                                                         |
| `page` fixture override           | Per-test | `Header.resetAppState()` after each authenticated test; failures attached to test result, never swallowed                                         |

### Test data & factories

- Static fixtures in `test-data/*.json` are **zod-validated at module load** in
  `src/utils/testData.ts`. Schema drift fails on import, not deep in a test run.
- Passwords are **never** in JSON — they come from `process.env.TEST_USER_PASSWORD`.
- Per-test variable data uses factories in `src/factories/` — e.g.
  `shippingFactory.build({ postalCode: '94016' })`. They wrap `src/utils/random.ts`
  (crypto-backed) for isolation.

### Flake handling

See [`docs/flake-handling.md`](docs/flake-handling.md). The three tools:

| Symptom                           | Tool                                               |
| --------------------------------- | -------------------------------------------------- |
| State takes time to converge      | `expect.poll(() => api.getStatus()).toBe('ready')` |
| Genuinely slow test               | `test.slow()`                                      |
| Known race, can't fix this sprint | `@quarantine` tag + ticket                         |

The `@quarantine` CI job is non-blocking and auto-skips when no tests are tagged. Every
other job uses `--grep-invert "@quarantine"` so flaky tests never block merges while
remaining alive and visible.

---

## Coding Standards

### Selectors — semantic only

Use the first option that uniquely identifies the element:

```
1. getByRole()         button/link/heading + accessible name
2. getByLabel()        form fields with associated <label>
3. getByPlaceholder()  inputs with placeholder text
4. getByText()         unique visible text
5. getByTestId()       data-test attribute (project default)
```

**Never use:**

- CSS classes (`.btn-primary`) — break on refactors
- XPath (`//div[2]/button`) — break on structural changes
- Positional selectors (`nth(2)`) without a `data-test` scope

`playwright.config.ts` sets `use.testIdAttribute: 'data-test'` (matches saucedemo). When
adapting to your app, change this to your frontend's convention (commonly
`data-testid`). If no semantic selector exists, the fix is to **add `data-test` to the
frontend**, not to write a CSS selector.

### Waiting — never `waitForTimeout`

```typescript
// ❌ Hides real timing issues
await page.waitForTimeout(2000);

// ✅ Wait for something specific
await expect(locator).toBeVisible();
await page.waitForURL('/dashboard');
await page.waitForResponse('**/api/orders');
await expect.poll(() => api.getStatus(), { timeout: 10_000 }).toBe('ready');
```

Locators auto-wait up to `actionTimeout: 10_000` (10 s). Navigations auto-wait up to
`navigationTimeout: 15_000`. A `waitForTimeout` is **always** a missing proper wait.

### Test structure — Arrange → Act → Assert

```typescript
test('user can create a project @regression', async ({ inventoryPage, header }) => {
  // Arrange
  await inventoryPage.goto();

  // Act
  await inventoryPage.addToCart('Sauce Labs Backpack');

  // Assert
  expect(await header.cartBadgeCount()).toBe(1);
});
```

One assertion theme per test. A test named "user can check out" verifies checkout — not
also "and sends the confirmation email."

### Page Objects — non-negotiable rules

1. **Extend `BasePage`** for full pages. Components take `Page` directly.
2. **Private locator fields.** Tests never touch raw locators. Use `private readonly`.
3. **No `expect()` inside a POM.** Use `locator.waitFor({ state: 'visible' })` for
   readiness. Assertions belong in tests.
4. **Methods describe user intent.** `login()`, not `clickLoginButton()`.
   `createProject(name)`, not `fillProjectNameAndSubmit()`.
5. **`waitForLoad()` is required.** Assert (via `waitFor`, not `expect`) a reliable
   page-ready indicator.
6. **Named exports only.** No default exports.
7. **One file per page or major flow.** Don't extract a class for a single button.

### POM template

```typescript
// src/pages/<Name>Page.ts
import { BasePage } from './BasePage';

export class <Name>Page extends BasePage {
  protected readonly path = '/<route>';

  private readonly heading = this.page.getByRole('heading', { name: '<title>' });
  private readonly submit  = this.page.getByTestId('submit-button');

  async waitForLoad(): Promise<void> {
    await this.heading.waitFor({ state: 'visible' });
  }

  async <action>(<param>: string): Promise<void> {
    // ...
  }
}
```

### Component template

```typescript
// src/components/<Name>.ts
import { Locator, Page } from '@playwright/test';

export class <Name> {
  private readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('<role>', { name: '<name>' });
  }

  async <action>(): Promise<void> {
    await this.root.getByRole('menuitem', { name: '<item>' }).click();
  }
}
```

### Fixtures

- Prefer fixtures over `beforeEach` — fixtures **compose**, `beforeEach` doesn't.
- Import `test` from `src/fixtures/base.fixture.ts` (**not** `@playwright/test`) in every
  test that uses shared page objects or worker auth.
- The fixture exposes one accessor per page object — never instantiate `new LoginPage()`
  in tests when the fixture provides `loginPage`.

### Tags

- Every test has at least one tag — embedded in the title: `'description @tag'`.
- `@smoke` tests: under 30 s each, under 2 min for the whole smoke suite.
- A test can have multiple tags: `'checkout completes @smoke @regression'`.
- `@quarantine` is opt-in for known-flaky tests — combine with another tag so the test
  still has a layer.

### File and class naming

| What              | Convention             | Example                       |
| ----------------- | ---------------------- | ----------------------------- |
| Page object files | PascalCase + `Page`    | `InventoryPage.ts`            |
| Component files   | PascalCase             | `Header.ts`                   |
| API wrapper files | PascalCase + `Api`     | `SauceDemoApi.ts`             |
| Factory files     | camelCase + `Factory`  | `shippingFactory.ts`          |
| Utility files     | camelCase              | `testData.ts`, `random.ts`    |
| Smoke tests       | `*.smoke.spec.ts`      | `login.smoke.spec.ts`         |
| Regression tests  | `*.regression.spec.ts` | `checkout.regression.spec.ts` |
| API tests         | `*.api.spec.ts`        | `contract.api.spec.ts`        |
| Accessibility     | `*.a11y.spec.ts`       | `login.a11y.spec.ts`          |
| Visual            | `*.visual.spec.ts`     | `login.visual.spec.ts`        |

---

## Agent Behavior Rules

When writing or editing **any** file in this project:

1. **Check `src/pages/` first.** Use an existing page object before creating a new one.
2. **Use the fixture.** Import from `src/fixtures/base.fixture.ts` in every test that
   needs auth or a shared page object.
3. **Tag every test.** No untagged tests — ever.
4. **No raw timeouts.** Never `waitForTimeout`. Replace with `waitFor`, `waitForURL`,
   `waitForResponse`, `expect.poll`, or `expect(locator).toBeVisible()`.
5. **Semantic locators only.** No CSS classes, no XPath, no `nth()` without a scoped
   container.
6. **Smoke stays small.** If a test takes more than 30 s, it belongs in `@regression`.
7. **Tests are independent.** Each test creates its own data via factories. No reliance
   on execution order.
8. **No credentials in code.** `process.env.*` only. `secret_sauce` literal appears
   **only** in `.env.example`.
9. **No `expect()` in page objects.** Move it to the test.
10. **No `any` types.** Use specific types, `unknown`, or zod-inferred types.
11. **Run typecheck + lint before claiming "done".** `npm run typecheck && npm run lint`
    must be clean.
12. **Update visual baselines deliberately.** Never `--update-snapshots` without
    reviewing the diff image-by-image first.

### When you encounter `any`, CSS, XPath, or `waitForTimeout` in existing code

Fix it. These are template defects, not "existing patterns" to preserve. Refactor the
locator semantically, add an explicit wait, or surface the type — and update tests to
match.

---

## Security & Guardrails

Read [`SECURITY.md`](SECURITY.md) for the full policy. Operative rules for agents:

### Secrets

- **Never commit** `.env.local`, `.auth/*`, ZAP output, or any file containing tokens,
  cookies, passwords, or session state. All gitignored.
- **Never paste secrets** into traces, screenshots, attachments, or PR comments. Trace
  files can contain auth cookies — when surfacing trace data, redact `Set-Cookie` and
  `Authorization` headers.
- **Never** print `process.env.TEST_USER_PASSWORD` to logs.
- The `.claude/settings.json` permission list **denies** reading `.env.local` and
  `.auth/*`. Do not work around this.

### Targets

- `BASE_URL` must be staging / test — **never** production. Tests create data and may
  exercise destructive flows.
- OWASP ZAP scans are passive (`-I`) and crawl-only. They never attack — but keep them
  pointed at non-prod.

### Dependencies

- `npm audit --omit=dev --audit-level=high` runs in CI on every PR and push to `main`.
  High-severity production vulns block merge.
- `dependency-review-action` blocks PRs that introduce new high-severity transitives.
- Dependabot keeps Playwright, axe-core, and pinned action SHAs current — review the
  weekly PRs and merge if smoke passes.

### Pre-commit gates

`husky` + `lint-staged` run on `git commit`:

```
pre-commit  →  eslint --fix + prettier --write on staged .ts / .js / .json / .yml / .md
pre-push    →  npm run typecheck
```

To skip (emergency only): `git commit --no-verify` — CI will still fail on the same
gates.

### Workflow permissions

All GitHub Actions workflows declare least-privilege `permissions:` blocks. The
`merge-smoke-report` job is the only one with `pull-requests: write` (for the PR comment).

---

## Playwright CLI — what to run when

### Day-to-day commands

```bash
# Tag-based filtering
npx playwright test --grep @smoke
npx playwright test --grep "@smoke|@api"
npx playwright test --grep-invert "@quarantine"

# File / test name
npx playwright test tests/smoke/login.smoke.spec.ts
npx playwright test --grep "user can log in"

# Browser project
npx playwright test --project=chromium             # default in CI
npx playwright test --project=chromium --project=firefox

# Parallelism
npx playwright test --workers=1                    # serial — for debugging shared state
npx playwright test --shard=1/4                    # CI sharding

# Interactive
npx playwright test --ui                           # best for authoring
npx playwright test --debug                        # Playwright Inspector
npx playwright test --headed                       # see the browser

# Flake reproduction
npx playwright test --repeat-each 5 tests/smoke/login.smoke.spec.ts

# Trace + report
npx playwright test --trace on                     # force traces for every test
npx playwright show-trace test-results/<test>/trace.zip
npx playwright show-report reports/html

# Visual baselines (always specify --project)
npx playwright test --grep @visual --project=chromium --update-snapshots
```

### Decision matrix

| Situation                                             | Command                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| Authoring a new test interactively                    | `--ui`                                                               |
| Stepping through a failing test                       | `--debug` on the failing file                                        |
| Verifying a change quickly                            | `npm run test:smoke`                                                 |
| Reproducing a flake locally                           | `--repeat-each 5`                                                    |
| Pre-release full suite, all browsers                  | `npx playwright test`                                                |
| Updating visual baselines after intentional UI change | `npm run test:visual:update` then commit                             |
| Investigating a CI failure                            | Download the merged HTML report artifact, open `show-report` locally |

### Browser installation

```bash
npx playwright install --with-deps chromium        # browser + Linux system libs
npx playwright install chromium                    # browser only (cache hit)
npx playwright install-deps                        # OS deps only (browsers already cached)
```

CI caches `~/.cache/ms-playwright` keyed on `package-lock.json`. On cache hit, only
`install-deps` runs (saves ~90 s per job).

### Common pitfalls

| Symptom                                               | Cause                                                                                          | Fix                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Error reading storage state from .auth/user-0.json`  | Worker auth fixture didn't run (test imported `test` from `@playwright/test`, not the fixture) | Change the import to `src/fixtures/base.fixture`                  |
| `getByTestId('username')` times out in worker fixture | `selectors.setTestIdAttribute` not called for fixture-scope context                            | Already handled in `base.fixture.ts` — don't bypass it            |
| `Cannot navigate to invalid URL` in worker fixture    | `browser.newContext()` doesn't inherit `use.baseURL`                                           | Already handled — fixture passes `baseURL` explicitly             |
| Visual test fails on first run                        | No baseline exists for this browser/OS                                                         | Generate with `--update-snapshots`, commit the PNG                |
| Visual test fails intermittently                      | Dynamic content not masked                                                                     | Add `mask: [page.getByTestId('timestamp')]` to `toHaveScreenshot` |
| Tests pass locally, fail in CI                        | Different `BASE_URL`, missing secret, or auth session expired                                  | Check GitHub Actions secrets, download trace artifact             |

---

## Tool and Skill Usage Guidelines

### When to use agents

| Task                                        | Agent                   |
| ------------------------------------------- | ----------------------- |
| Write a new test from a feature description | `agents/test-writer.md` |
| Debug a failing or flaky test               | `agents/triage.md`      |
| Create a new Page Object class              | `agents/pom-builder.md` |

### When to use skills

| Task                                        | Skill                          |
| ------------------------------------------- | ------------------------------ |
| Produce a test file                         | `skills/write-test.md`         |
| Scaffold a POM class                        | `skills/create-page-object.md` |
| Find the right locator for an element       | `skills/generate-locator.md`   |
| Analyze a test failure from output or trace | `skills/analyze-failure.md`    |
| Execute tests in the right mode             | `skills/run-tests.md`          |

### When to use commands

| Task                              | Command                        |
| --------------------------------- | ------------------------------ |
| Run the full suite                | `commands/test.md`             |
| Quick smoke validation            | `commands/smoke.md`            |
| Static analysis before committing | `commands/lint.md`             |
| Regenerate visual baselines       | `commands/update-snapshots.md` |
| Scaffold a new page + tests       | `commands/new-page.md`         |

### When to use Playwright MCP

`.mcp.json` configures `@playwright/mcp` (headless by default). Use it for locator
discovery and reproducing test steps interactively — it keeps the context in the
conversation.

| Situation                                                       | MCP tool                                              |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| Need a locator but no HTML is available                         | `browser_navigate` → `browser_snapshot`               |
| Writing a new page object for an unfamiliar page                | `browser_navigate` → `browser_snapshot`               |
| Debugging a failing test — want to see what the page looks like | `browser_navigate` → `browser_screenshot`             |
| Verifying a visual baseline before committing                   | `browser_navigate` → `browser_screenshot`             |
| Reproducing a flaky step                                        | `browser_navigate` → `browser_click` / `browser_fill` |

**MCP rules:**

- Prefer `browser_snapshot` (accessibility tree) over `browser_screenshot` for locator
  discovery — the tree gives you roles, labels, and text directly.
- **Never** navigate to production — staging or local dev servers only.
- MCP sessions are ephemeral. Don't rely on browser state persisting between tool calls.
- MCP replaces standalone `npx playwright codegen` for locator work in conversations.

---

## CI / CD reference

### `ci.yml` — every push + PR + nightly

```
lint → smoke (sharded 2-way) → {merge-report (PR comment), regression, cross-browser,
                                accessibility, visual, quarantine} → notify
```

Highlights:

- **Sharded smoke** with blob reports merged into one HTML artifact.
- **Playwright browser cache** keyed on `package-lock.json` — cache hit installs system
  deps only.
- **PR comment** posted by `actions/github-script` with pass/fail/flaky/skipped/duration
  - per-failure list + report links. Updates the existing comment instead of spamming.
- **`@quarantine` job** is non-blocking and auto-skipped when no tests are tagged.
- **Cross-browser nightly** — firefox + webkit run on schedule only, never on PRs.

### `security.yml` — security gates

```
codeql · npm-audit · dependency-review (PR) · gitleaks · zap-scan (scheduled)
```

### `lighthouse.yml` — performance budgets

```
lighthouse (every PR + manual — perf 0.85, a11y 0.90, BP 0.90)
```

Thresholds in `lighthouserc.yml`.

### Runtime env knobs

| Variable                     | Effect                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `CI`                         | Auto-set by GitHub Actions. Toggles `retries: 2`, `workers: 4`, blob reporter, teardown wipe |
| `PW_KEEP_AUTH=1`             | Skip the start-of-run wipe of `.auth/user-*.json` (local debugging only)                     |
| `PW_DISABLE_VIDEO=1`         | Sets `video: 'off'` (useful when ffmpeg can't install)                                       |
| `PW_CHROMIUM_CHANNEL=chrome` | Run against system-installed Chrome instead of Playwright's chromium                         |

---

## File Structure Overview

```
.
├── CLAUDE.md                       ← this file
├── README.md                       ← project overview + CLI reference
├── GETTING_STARTED.md              ← zero-to-CI onboarding
├── CONTRIBUTING.md                 ← PR workflow for humans
├── SECURITY.md                     ← secret-handling + threat model
├── LICENSE                         ← MIT
├── TODO.md                         ← adapt-the-template checklist
│
├── agents/                         ← Claude agent definitions
│   ├── test-writer.md
│   ├── triage.md
│   └── pom-builder.md
│
├── skills/                         ← Claude skill definitions
│   ├── write-test.md
│   ├── create-page-object.md
│   ├── generate-locator.md
│   ├── analyze-failure.md
│   └── run-tests.md
│
├── commands/                       ← Claude command playbooks
│   ├── test.md
│   ├── smoke.md
│   ├── lint.md
│   ├── update-snapshots.md
│   └── new-page.md
│
├── docs/
│   └── flake-handling.md           ← expect.poll · test.slow · @quarantine
│
├── .claude/
│   └── settings.json               ← tool permissions + secret denylist
│
├── .github/
│   ├── workflows/{ci,security,lighthouse}.yml
│   ├── ISSUE_TEMPLATE/{bug_report,feature_request}.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   └── dependabot.yml
│
├── .husky/                         ← pre-commit + pre-push hooks
│
├── src/
│   ├── pages/                      ← POM (extend BasePage, private locators)
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInfoPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   │
│   ├── components/                 ← sub-page objects
│   │   └── Header.ts
│   │
│   ├── api/                        ← typed REST wrappers with zod schemas
│   │   └── SauceDemoApi.ts
│   │
│   ├── fixtures/                   ← Playwright test extensions
│   │   ├── base.fixture.ts         ← page objects + worker-scoped auth
│   │   ├── global.setup.ts         ← env validation + stale-auth cleanup
│   │   └── global.teardown.ts      ← CI session wipe
│   │
│   ├── factories/                  ← typed test-data factories
│   │   ├── shippingFactory.ts
│   │   └── index.ts
│   │
│   └── utils/
│       ├── testData.ts             ← zod-validated JSON loader
│       └── random.ts               ← crypto-backed random helpers
│
├── tests/
│   ├── smoke/                      ← @smoke (login, add-to-cart)
│   ├── regression/                 ← @regression (checkout E2E, sort)
│   ├── api/                        ← @api (contract + availability)
│   ├── accessibility/              ← @a11y (axe-core WCAG)
│   └── visual/                     ← @visual (screenshot diffs + README.md)
│
├── test-data/                      ← zod-validated at module load
│   ├── users.json
│   └── products.json
│
├── .auth/                          ← gitignored — per-worker storage state
├── reports/                        ← gitignored — HTML + JSON output
├── blob-report/                    ← gitignored — sharded blob output
│
├── playwright.config.ts
├── lighthouserc.yml
├── eslint.config.mjs
├── tsconfig.json
├── package.json
└── .env.example
```

---

## Definition of "done" for a PR

Before claiming a task complete:

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes (or run `npm run format` to auto-fix)
- [ ] `npm run test:smoke` passes against your target
- [ ] Every new test is tagged
- [ ] No `waitForTimeout`, no CSS class selectors, no XPath
- [ ] No `any` types
- [ ] No credentials in code
- [ ] No `expect()` inside POMs
- [ ] If POMs changed: tests still pass
- [ ] If visual baselines changed: diffs reviewed image-by-image and committed
- [ ] If user-facing behavior changed: `README.md` / `CLAUDE.md` / `GETTING_STARTED.md`
      updated accordingly
