# Playwright QA Template

[![CI](https://github.com/thoangdev/Web-QA-Automation-Pipeline-Public/actions/workflows/ci.yml/badge.svg)](https://github.com/thoangdev/Web-QA-Automation-Pipeline-Public/actions/workflows/ci.yml)
[![Security](https://github.com/thoangdev/Web-QA-Automation-Pipeline-Public/actions/workflows/security.yml/badge.svg)](https://github.com/thoangdev/Web-QA-Automation-Pipeline-Public/actions/workflows/security.yml)
[![Playwright](https://img.shields.io/npm/v/@playwright/test?label=Playwright&color=2EAD33)](https://playwright.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade QA pipeline for SaaS web apps. Clone, point at your app, ship with
confidence. E2E · API · Visual · Accessibility · Performance · Security — from a single
toolchain.

![QA Automation Template Promo](https://i.ibb.co/99xYMqHN/43bf42d3-9411-4fcf-ba86-1bb1864e8e7c.png)

The template ships **pre-wired against [saucedemo.com](https://www.saucedemo.com)** so it
works the moment you clone it. Adopt it by swapping `BASE_URL` to your app and adapting
the page objects.

> New here? Read [`GETTING_STARTED.md`](GETTING_STARTED.md) for the zero-to-CI walkthrough,
> and [`CLAUDE.md`](CLAUDE.md) for the rules Claude (and reviewers) enforce on every PR.

---

## Contents

1. [Philosophy](#philosophy)
2. [What you get](#what-you-get)
3. [Quick Start](#quick-start)
4. [Project Layout](#project-layout)
5. [The Page Object Model](#the-page-object-model)
6. [Fixtures & Worker-Scoped Auth](#fixtures--worker-scoped-auth)
7. [Test Data & Factories](#test-data--factories)
8. [Tagging Strategy](#tagging-strategy)
9. [Playwright CLI Reference](#playwright-cli-reference)
10. [Best Practices & Guardrails](#best-practices--guardrails)
11. [Branch Protection & Merge Workflow](#branch-protection--merge-workflow)
12. [Security](#security)
13. [CI / CD](#ci--cd)
14. [Environment Variables](#environment-variables)
15. [Scripts](#scripts)
16. [Pre-commit hooks](#pre-commit-hooks)
17. [Adapting to Your App](#adapting-to-your-app)
18. [Using with Claude Code](#using-with-claude-code)

---

## Philosophy

- **One framework, all layers.** Playwright handles E2E, API, and visual testing
  natively. axe-core for a11y runs inside the same browser. No extra HTTP clients, no
  second runner.
- **Fast feedback first.** Smoke + API run on every push in under 2 minutes, sharded.
  Full regression runs nightly or on demand.
- **Enterprise defaults.** Worker-scoped auth, zod-validated test data, typed factories,
  pre-commit hooks, CodeQL + gitleaks + dependency review, sharded reports merged into a
  single HTML artifact, PR comments with failure summaries.
- **Free by default.** GitHub Actions, Playwright, axe-core, OWASP ZAP, Lighthouse CI,
  CodeQL, Dependabot, gitleaks — all free for public repos and generous on private.
- **You own it.** This is not a framework you import. Every file is yours to modify.

---

## What you get

| Layer              | Tool                                                                         | Cost           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| E2E, API, visual   | [Playwright](https://playwright.dev) 1.60 + TypeScript 6                     | Free / OSS     |
| Accessibility      | [axe-core](https://github.com/dequelabs/axe-core) via `@axe-core/playwright` | Free / OSS     |
| Schema validation  | [zod](https://zod.dev) 4                                                     | Free / OSS     |
| Security scan      | [OWASP ZAP](https://www.zaproxy.org/) baseline scan                          | Free / OSS     |
| Performance        | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)               | Free / OSS     |
| Static analysis    | [CodeQL](https://codeql.github.com/)                                         | Free on GitHub |
| Secret scanning    | [gitleaks](https://github.com/gitleaks/gitleaks)                             | Free / OSS     |
| Dependency review  | GitHub Dependabot + `dependency-review-action`                               | Free on GitHub |
| Pre-commit gates   | husky 9 + lint-staged 17                                                     | Free / OSS     |
| CI/CD              | GitHub Actions                                                               | Free tier      |
| Slack alerts       | Slack Incoming Webhooks                                                      | Free           |
| AI browser control | [@playwright/mcp](https://github.com/microsoft/playwright-mcp)               | Free / OSS     |
| Jira integration   | [mcp-atlassian](https://github.com/sooperset/mcp-atlassian) + `JiraApi.ts`   | Free / OSS     |

---

## Quick Start

```bash
# 1. Install
npm install
npx playwright install --with-deps chromium

# 2. Optional — point at your own app (defaults to saucedemo.com)
cp .env.example .env.local   # edit BASE_URL / TEST_USER_USERNAME / TEST_USER_PASSWORD

# 3. Smoke test
npm run test:smoke

# 4. Open the report
npm run report
```

You should see 4 smoke tests pass against saucedemo. Full suite (`npm test`) runs 15
tests in under 7 seconds locally.

---

## Project Layout

```
.
├── src/
│   ├── pages/                    POM: one file per page or major flow
│   │   ├── BasePage.ts           abstract base — `goto()`, `waitForLoad()`
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInfoPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   │
│   ├── components/               reusable sub-page objects
│   │   └── Header.ts             cart badge, menu, logout, reset
│   │
│   ├── api/                      typed REST wrappers with zod schemas
│   │   ├── SauceDemoApi.ts       pattern reference — mirrors Jira wrapper shape
│   │   └── JiraApi.ts            Jira REST wrapper (getTicket, createDefect, etc.)
│   │
│   ├── fixtures/                 Playwright test extensions
│   │   ├── base.fixture.ts       page objects + worker-scoped auth
│   │   ├── global.setup.ts       env validation + stale-auth cleanup
│   │   └── global.teardown.ts    CI session wipe
│   │
│   ├── factories/                typed test-data factories
│   │   ├── shippingFactory.ts
│   │   └── index.ts
│   │
│   └── utils/
│       ├── testData.ts           zod-validated JSON loader
│       ├── random.ts             crypto-backed random helpers
│       └── environmentCheck.ts  exponential backoff poller for BASE_URL
│
├── tests/
│   ├── smoke/                    @smoke — critical path (< 2 min total)
│   ├── regression/               @regression — full coverage, nightly
│   ├── api/                      @api — contract + availability
│   ├── accessibility/            @a11y — axe-core WCAG 2.1 AA
│   └── visual/                   @visual — screenshot diffs
│
├── test-data/                    static JSON, zod-validated at load
│   ├── users.json
│   └── products.json
│
├── agents/                       Claude agent definitions
│   ├── test-writer.md            write tests from feature descriptions
│   ├── triage.md                 debug failing or flaky tests
│   ├── pom-builder.md            create new Page Object classes
│   └── jira-qa-runner.md         full Jira ticket → test → report → defect cycle
│
├── skills/                       Claude skill definitions (atomic capabilities)
│   ├── write-test.md
│   ├── create-page-object.md
│   ├── generate-locator.md
│   ├── analyze-failure.md
│   ├── run-tests.md
│   ├── pull-jira-ticket.md       extract AC from Jira tickets
│   ├── self-heal-test.md         one-attempt selector/timing fix
│   ├── write-run-report.md       write reports/runs/YYYY-MM-DD-<ticket>.md
│   ├── create-jira-defect.md     dedup-checked defect creation
│   └── store-qa-memory.md        persist patterns to Claude memory
│
├── commands/                     Claude command playbooks
│   ├── test.md
│   ├── smoke.md
│   ├── lint.md
│   ├── update-snapshots.md
│   ├── new-page.md
│   ├── jira-qa-run.md            end-to-end Jira QA runbook
│   └── check-environment.md      poll BASE_URL until ready
│
├── docs/
│   ├── flake-handling.md         expect.poll · test.slow · @quarantine
│   └── contacts.md               team escalation, Jira keys, token rotation
│
├── .github/
│   ├── workflows/                ci · security · lighthouse
│   ├── ISSUE_TEMPLATE/
│   ├── CODEOWNERS                auto-assign reviewers per path
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
│
├── .husky/                       pre-commit + pre-push hooks
├── .auth/                        gitignored — per-worker storage state
├── reports/                      gitignored — HTML + JSON output
│   └── runs/                     per-run Jira workflow reports (gitignored)
├── blob-report/                  gitignored — sharded blob output
│
├── playwright.config.ts
├── lighthouserc.yml
├── eslint.config.mjs
├── tsconfig.json
├── package.json
├── SECURITY.md                   secret handling + threat model
├── CONTRIBUTING.md               PR + coding standards for humans
├── CLAUDE.md                     PR + coding standards for AI agents
├── GETTING_STARTED.md            full onboarding guide
└── TODO.md                       adapt-the-template checklist
```

---

## The Page Object Model

Every page extends `BasePage` and follows the same shape. Locators are private, methods
are named for user intent, no `expect()` lives in a POM.

### Base class

```typescript
// src/pages/BasePage.ts
import { Page, Response } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected abstract readonly path: string;

  async goto(): Promise<Response | null> {
    const res = await this.page.goto(this.path);
    await this.waitForLoad();
    return res;
  }

  abstract waitForLoad(): Promise<void>;

  url(): string {
    return this.page.url();
  }
}
```

### Page class — the pattern

```typescript
// src/pages/LoginPage.ts
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/';

  // Private locator fields — never exposed to tests.
  private readonly username = this.page.getByTestId('username');
  private readonly password = this.page.getByTestId('password');
  private readonly submit = this.page.getByTestId('login-button');
  private readonly error = this.page.getByTestId('error');
  private readonly logo = this.page.locator('.login_logo');

  // Wait for a reliable page-ready indicator. No expect() — that belongs in tests.
  async waitForLoad(): Promise<void> {
    await this.logo.waitFor({ state: 'visible' });
  }

  // Method names describe user intent, not implementation details.
  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  async loginAndWaitForInventory(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.page.waitForURL('**/inventory.html');
  }

  async getErrorMessage(): Promise<string> {
    return (await this.error.textContent()) ?? '';
  }
}
```

### Component class — for shared UI

Components don't extend `BasePage`. They take a `Page` and expose actions on a recurring
UI fragment (header, modal, drawer).

```typescript
// src/components/Header.ts
export class Header {
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  // ...

  constructor(private readonly page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    // ...
  }

  async cartBadgeCount(): Promise<number> { /* ... */ }
  async openCart(): Promise<void> { /* ... */ }
  async logout(): Promise<void> { /* ... */ }
  async resetAppState(): Promise<void> { /* ... */ }
}
```

### POM rules — non-negotiable

1. **Extend `BasePage`** for full pages. Components take `Page` directly.
2. **Locators are `private readonly`.** Tests never touch raw locators.
3. **No `expect()` inside a POM.** Use `locator.waitFor()` for readiness. Assertions
   belong in tests.
4. **Methods describe user intent.** `login()`, not `clickLoginButton()`.
5. **Named exports only.** No default exports.
6. **One file per page or major flow.** Don't extract a class for a single button.
7. **`waitForLoad()` is required.** Assert (via `waitFor`, not `expect`) that the page is
   truly ready.

---

## Fixtures & Worker-Scoped Auth

Tests **import `test` from `src/fixtures/base.fixture.ts`** — never from
`@playwright/test` directly — to get page objects + worker-scoped auth.

### Worker-scoped authentication

Each Playwright worker performs **one** login on first use and writes its own storage
state file:

```
.auth/user-0.json   ← worker 0
.auth/user-1.json   ← worker 1
.auth/user-2.json   ← worker 2
.auth/user-3.json   ← worker 3
```

Tests within the same worker share that session. Tests in different workers never share
a session. This prevents:

- Per-user rate limit collisions
- Session sticky locks (e.g. "logged in elsewhere" warnings)
- CSRF nonce / token rotation races
- Concurrent cart / draft state collisions

### Why not one global `auth.json`?

A single shared session is fine for saucedemo but breaks on real apps as soon as you
have:

- Server-side rate limits per session
- Per-session CSRF tokens that rotate
- Server-side cart state
- Audit logs that flag concurrent activity from the same session

Worker-scoped auth eliminates all four with no test code changes.

### Using a fresh, unauthenticated context

Tests that exercise the login flow itself, or any logged-out path, use the
`freshContextPage` fixture:

```typescript
import { test, expect } from '../../src/fixtures/base.fixture';
import { LoginPage } from '../../src/pages/LoginPage';

test('locked-out user sees the locked error @smoke', async ({ freshContextPage }) => {
  const loginPage = new LoginPage(freshContextPage);
  await loginPage.goto();
  await loginPage.login('locked_out_user', process.env.TEST_USER_PASSWORD!);
  expect(await loginPage.getErrorMessage()).toContain('locked out');
});
```

`freshContextPage` spawns a clean browser context with `storageState: undefined` and the
project's `baseURL` — and closes it when the test finishes.

### Global setup + teardown

| Phase    | File                              | Responsibility                                                                                                      |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Pre-run  | `src/fixtures/global.setup.ts`    | Validate env vars, enforce URL shape, wipe stale `.auth/user-*.json` from prior runs (skip with `PW_KEEP_AUTH=1`)   |
| Post-run | `src/fixtures/global.teardown.ts` | Wipe **all** `.auth/*.json` in CI so session cookies never leak into uploaded artifacts                             |
| Per-test | `page` fixture override           | Run `Header.resetAppState()` after each authenticated test — reset failures attached to test results, not swallowed |

---

## Test Data & Factories

### Static fixtures — zod-validated at load

`test-data/users.json` and `test-data/products.json` are parsed through zod schemas in
`src/utils/testData.ts` **at module load time**. If a schema breaks, the import fails —
not a random test deep in the run.

```typescript
import { z } from 'zod';
import usersJson from '../../test-data/users.json';

const UserEntrySchema = z.object({
  username: z.string().min(1),
  description: z.string().min(1),
});

const UsersFileSchema = z.object({
  users: z.object({
    standard: UserEntrySchema,
    lockedOut: UserEntrySchema,
    // ...
  }),
});

// Throws here on import if users.json drifts from the schema.
const usersFile = UsersFileSchema.parse(usersJson);
```

Passwords are **never** in JSON. They come from `process.env.TEST_USER_PASSWORD` via
`getUser()`.

### Factories — for per-test variable data

```typescript
import { shippingFactory } from '../../src/factories';

test('checkout accepts any valid shipping info @regression', async ({ checkoutInfoPage }) => {
  const shipping = shippingFactory.build(); // random valid
  // ...
});

test('checkout rejects missing first name @regression', async ({ checkoutInfoPage }) => {
  const shipping = shippingFactory.invalid.missingFirstName(); // pre-shaped invalid
  // ...
});

test('checkout still works for a specific zip @regression', async ({ checkoutInfoPage }) => {
  const shipping = shippingFactory.build({ postalCode: '94016' }); // override
  // ...
});
```

Factories wrap `src/utils/random.ts` (crypto-backed) so every test produces
isolated, unique data — no shared fixtures, no execution-order dependencies.

---

## Tagging Strategy

Tags live in test titles and are matched with `--grep`. Every test must have at least
one tag.

| Tag           | Folder                 | When it runs             | Purpose                                             |
| ------------- | ---------------------- | ------------------------ | --------------------------------------------------- |
| `@smoke`      | `tests/smoke/`         | Every push + PR          | Critical paths — under 30 s each, under 2 min total |
| `@regression` | `tests/regression/`    | Nightly + push to `main` | Full happy + unhappy + edge cases                   |
| `@api`        | `tests/api/`           | Every push + PR          | REST contracts + availability                       |
| `@a11y`       | `tests/accessibility/` | Every PR + nightly       | axe-core WCAG 2.1 AA                                |
| `@visual`     | `tests/visual/`        | Every PR (non-blocking)  | Screenshot diffs per browser-OS                     |
| `@quarantine` | anywhere               | Non-blocking job         | Known-flaky tests that should still run             |

A test can have multiple tags: `'checkout completes @smoke @regression'`.

---

## Playwright CLI Reference

### Run modes

```bash
# Tag-based
npx playwright test --grep @smoke
npx playwright test --grep "@smoke|@api"
npx playwright test --grep-invert "@quarantine"

# Folder / file / test name
npx playwright test tests/regression/
npx playwright test tests/smoke/login.smoke.spec.ts
npx playwright test --grep "user can log in"

# Browser project
npx playwright test --project=chromium       # default in CI
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=chromium --project=firefox   # multi

# Parallelism
npx playwright test --workers=1              # serial — for debugging shared-state issues
npx playwright test --shard=1/4              # one of four shards (CI-friendly)

# Visibility
npx playwright test --headed                 # show the browser
npx playwright test --debug                  # step through with Playwright Inspector
npx playwright test --ui                     # interactive UI mode (best for authoring)

# Flake reproduction
npx playwright test --repeat-each 5 tests/smoke/login.smoke.spec.ts

# Failure analysis
npx playwright test --trace on               # record traces for every test
npx playwright show-trace test-results/<test>/trace.zip
npx playwright show-report reports/html
```

### Visual baselines

```bash
# Generate per-browser baselines (commit results)
npx playwright test --grep @visual --project=chromium --update-snapshots
npx playwright test --grep @visual --project=firefox  --update-snapshots
npx playwright test --grep @visual --project=webkit   --update-snapshots

# Verify after generating
npx playwright test --grep @visual --project=chromium
```

See [`tests/visual/README.md`](tests/visual/README.md) for the baseline convention.

### Codegen (locator authoring)

```bash
npx playwright codegen https://your-staging-app.com
```

Prefer **Playwright MCP** when working inside Claude Code — it keeps the context in the
conversation. Use `codegen` standalone only when MCP isn't available.

### Browser & dependency install

```bash
npx playwright install              # download bundled browsers
npx playwright install --with-deps  # + apt-install Linux system libs
npx playwright install chromium     # one browser only
npx playwright install-deps         # OS deps only (when cache already has browsers)
```

### Report merge (sharded CI)

```bash
# Each shard writes a blob report; merge into one HTML artifact
npx playwright merge-reports --reporter html ./blob-report-shard-1 ./blob-report-shard-2
```

---

## Best Practices & Guardrails

### Selectors — semantic only, in priority order

```typescript
1. getByRole('button', { name: 'Sign in' })   // role + accessible name
2. getByLabel('Email address')                // <label> association
3. getByPlaceholder('Search…')                // placeholder text
4. getByText('Confirm order')                 // unique visible text
5. getByTestId('submit-btn')                  // data-test / data-testid attribute
```

**Never** use:

- CSS classes (`.btn-primary`) — break on refactors
- XPath (`//div[2]/button`) — break on structural changes
- Positional selectors (`nth(2)`) without a `data-test` container scope

If no semantic selector exists, the fix is to **add `data-test` to the frontend**, not to
write a fragile CSS selector. The template's `testIdAttribute` is `data-test` (matches
saucedemo) — change it in `playwright.config.ts` to match your frontend.

### Waiting — never `waitForTimeout`

```typescript
// ❌ Hides real timing issues
await page.waitForTimeout(2000);

// ✅ Wait for something specific
await expect(locator).toBeVisible();
await page.waitForURL('/dashboard');
await page.waitForResponse('**/api/orders');
await expect.poll(() => api.getStatus()).toBe('ready');
```

Playwright's locators auto-wait up to the configured `actionTimeout` (10 s) and
`navigationTimeout` (15 s). A `waitForTimeout` is **always** a missing proper wait.

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

### Test isolation rules

- Every test creates its own data via factories. No shared mutable state across tests.
- After every authenticated test, the `page` fixture calls `Header.resetAppState()` to
  reset saucedemo's per-session cart/sort state.
- Worker storage state is shared **within** a worker, never across workers.
- Tests must not depend on execution order — any test must be runnable alone.

### Typing rules

- No `any` types — use specific types, `unknown`, or zod-inferred types.
- All zod schemas must be exported alongside their inferred type (`z.infer<typeof Schema>`).
- Passwords and tokens come from `process.env.*` — never inline literals.
- Avoid non-null assertions (`!`) on user input — validate at the boundary instead.

### Flake prevention

See [`docs/flake-handling.md`](docs/flake-handling.md) for the full playbook:

| Symptom                                              | Tool                      |
| ---------------------------------------------------- | ------------------------- |
| Assertion flakes — state takes time to converge      | `expect.poll(...)`        |
| Test is just slow (large uploads, video, long flows) | `test.slow()`             |
| Known race condition, can't fix this sprint          | `@quarantine` + ticket    |
| Test passes locally, fails in CI consistently        | **Not flake** — env issue |
| Test fails on retry but passes after a re-run        | Real flake — investigate  |

### Code-style guardrails (enforced by CI)

- `tsc --noEmit` clean — strict mode, `forceConsistentCasingInFileNames`
- `eslint .` clean — `no-explicit-any`, `no-unused-vars`, `no-require-imports`
- `prettier --check .` clean — auto-fixed by pre-commit hook
- All checks run in CI's `lint` job — failures block merge

### Definition of "done" for any PR

Before requesting review, all of these must be true:

- [ ] `npm run typecheck` passes — no TypeScript errors
- [ ] `npm run lint` passes — no ESLint violations
- [ ] `npm run format:check` passes — or run `npm run format` to auto-fix
- [ ] `npm run test:smoke` passes against staging/test environment
- [ ] Every new test has at least one tag in its title string
- [ ] No `waitForTimeout` anywhere in new or modified code
- [ ] No CSS class selectors or XPath selectors
- [ ] No `any` types
- [ ] No credentials in source code — `process.env.*` only
- [ ] No `expect()` calls inside page objects
- [ ] If POMs changed — all affected tests still pass
- [ ] If visual baselines changed — diffs reviewed image-by-image and committed
- [ ] If user-facing behavior changed — `README.md` and `CLAUDE.md` updated

---

## Branch Protection & Merge Workflow

This section defines the governance rules for the `main` branch. Every contributor
(human or AI agent) follows the same path.

### Branch protection rules (configure in GitHub)

Enable these settings under **Settings → Branches → Branch protection rules → `main`**:

| Rule | Setting | Why |
|------|---------|-----|
| Require a pull request before merging | ✅ On | No direct pushes — ever |
| Required approvals | 1 (or 2 for release branches) | Human review before merge |
| Dismiss stale reviews | ✅ On | New commits invalidate prior approvals |
| Require review from code owners | ✅ On | `.github/CODEOWNERS` auto-assigns reviewers |
| Require status checks to pass | ✅ On | `lint` + `smoke` must be green |
| Require branches to be up to date | ✅ On | No merging stale branches |
| Restrict who can push to `main` | Admins only | Non-admins can never push directly |
| Allow force pushes | ❌ Off | History is immutable |
| Allow deletions | ❌ Off | `main` cannot be deleted |

> **Admin note:** Admins *can* bypass branch protection. Use that power only for
> emergency hotfixes. Document every bypass in the PR description.

### Contributor workflow (non-admin)

Every change — including AI-generated code — goes through this path:

```
1. Branch    git checkout -b feat/PROJ-123-add-checkout-tests
2. Develop   make changes locally
3. Gate      npm run typecheck && npm run lint && npm run test:smoke
4. Commit    git commit  (pre-commit hook runs automatically)
5. Push      git push origin feat/PROJ-123-add-checkout-tests
6. PR        open PR → fill in template → CI runs automatically
7. Review    address comments → get 1 approval from CODEOWNERS
8. Merge     squash and merge (never rebase onto main without approval)
```

**Branch naming convention:**

| Type | Pattern | Example |
|------|---------|---------|
| Feature / new test | `feat/<ticket>-<slug>` | `feat/PROJ-123-checkout-tests` |
| Bug fix | `fix/<ticket>-<slug>` | `fix/QA-456-login-selector` |
| POM addition | `pom/<page-name>` | `pom/checkout-page` |
| Chore / config | `chore/<slug>` | `chore/update-playwright` |
| Release | `release/<version>` | `release/v2.1.0` |

### Code review checklist (for reviewers)

When reviewing a PR, verify each item:

**Test quality**
- [ ] Tests are tagged — no untagged tests
- [ ] Each test is self-contained — no execution-order dependencies
- [ ] `@smoke` tests run in under 30 s each
- [ ] No `waitForTimeout` — only semantic waits
- [ ] No CSS class selectors or XPath

**Page Object quality**
- [ ] Locators are `private readonly` — not exposed to test files
- [ ] Methods are named for user intent (`login()`, not `clickLoginButton()`)
- [ ] `waitForLoad()` is implemented and uses `waitFor`, not `expect`
- [ ] No `expect()` calls inside the POM

**Code quality**
- [ ] No `any` types
- [ ] No credentials in source code
- [ ] TypeScript compiles cleanly (`npm run typecheck`)
- [ ] ESLint passes cleanly (`npm run lint`)

**Security**
- [ ] No `.env.local`, `.auth/*`, or token values added to the PR
- [ ] No new dependencies without justification (check the diff in `package-lock.json`)
- [ ] No hardcoded URLs pointing to production environments

**Documentation**
- [ ] New page objects are reflected in `README.md` layout (if structure changed)
- [ ] New env vars added to `.env.example` and `CLAUDE.md` knobs table
- [ ] If a new test type was added, CI workflow is updated to run it

### AI-generated code policy

Code generated by Claude (or any AI assistant) is held to **exactly the same standard**
as human-written code. There are no exceptions.

- AI-generated tests must go through the same PR → review → merge workflow
- The reviewer is responsible for catching AI anti-patterns (`waitForTimeout`, CSS
  selectors, `any` types, missing tags)
- Use `agents/jira-qa-runner.md` for structured AI-driven test generation — it enforces
  coding standards before outputting files
- Never commit directly from a Claude session without running the full pre-push gate:
  ```bash
  npm run typecheck && npm run lint && npm run test:smoke
  ```

### Emergency hotfix process (admins only)

When a production regression needs an immediate fix:

1. Push directly to `main` (admin bypass — document why in commit message)
2. Open a PR **after** the push to capture the review
3. Run `npm run test:smoke` on the fix before pushing
4. Tag the commit: `git tag hotfix/YYYY-MM-DD-description`
5. Post a summary in the team Slack channel

This process must not become routine. If hotfixes happen more than once a month,
add the scenario to the smoke suite.

### Squash and merge — always

- **Squash merge** for feature branches and bug fixes — one clean commit on `main`
- **Merge commit** for release branches — preserves the release history
- **Never rebase onto `main`** — it rewrites commit hashes and breaks any linked PRs

---

## Security

Read [`SECURITY.md`](SECURITY.md) for the full policy. Summary:

### Secret-handling rules

- **Never commit** `.env.local`, `.auth/*`, ZAP output, or anything with tokens,
  passwords, or session state. All gitignored.
- Read credentials from `process.env.*` only — never inline in source.
- Saucedemo's `secret_sauce` password appears **only** in `.env.example`. Anywhere else
  is a CI failure.
- CI uses these GitHub Actions secrets:
  `BASE_URL`, `TEST_USER_USERNAME`, `TEST_USER_PASSWORD`, `SLACK_WEBHOOK_URL`,
  `LHCI_GITHUB_APP_TOKEN`.
- Jira credentials (`JIRA_API_TOKEN`) follow the same rule — never in source, stored in
  GitHub Actions secrets, rotated every 90 days (see `docs/contacts.md`).

### Target rules

- `BASE_URL` must be staging or test — never production. Tests create state, exercise
  destructive flows, and may trip rate limits.
- OWASP ZAP runs **passive** baseline scans (`-I`). It crawls — does not attack — but
  keep it pointed at non-prod.

### CI hardening

| Layer                   | Tool / config                                                                   |
| ----------------------- | ------------------------------------------------------------------------------- |
| Static analysis         | CodeQL (`security-events: write`)                                               |
| Dependency vulns (prod) | `npm audit --omit=dev --audit-level=high` — blocks merge                        |
| Dependency review (PR)  | `dependency-review-action` — blocks new high-severity transitives               |
| Secret scanning         | `gitleaks` on every push + PR                                                   |
| Workflow permissions    | Least-privilege `permissions:` block on every workflow                          |
| Concurrency             | `cancel-in-progress: true` on PRs only — pushes and schedules run to completion |
| Action pinning          | Major-version tags via Dependabot weekly updates                                |

### Session hygiene

- `global.teardown.ts` wipes **all** `.auth/*.json` in CI so saved cookies never end up
  in uploaded artifacts.
- `global.setup.ts` wipes stale auth from prior runs at the start of every run (skip
  with `PW_KEEP_AUTH=1` for local debugging).
- Worker storage states live in `.auth/user-<index>.json` — gitignored.

### Reporting a vulnerability

Open a **private security advisory** — never a public issue. See `SECURITY.md`.

---

## CI / CD

Three workflows, every one with least-privilege permissions and `paths-ignore` for docs.

### `ci.yml` — every push + PR + nightly

```
lint                              (typecheck + eslint + prettier)
  └── smoke + api (sharded 2-way) (chromium, with browser cache)
        ├── merge-smoke-report    (blob → HTML + JSON, PR comment, 90-day results.json)
        ├── regression            (nightly + main only)
        ├── cross-browser smoke   (firefox + webkit, nightly only)
        ├── accessibility
        ├── visual                (non-blocking)
        ├── quarantine            (non-blocking, auto-skipped when empty)
        └── notify                (Slack, push + schedule only)
```

Key features:

- **Sharded smoke** — 2 parallel jobs, blob reports merged into one HTML artifact.
- **Playwright browser cache** — `~/.cache/ms-playwright` keyed on `package-lock.json`.
  Cache hit runs `install-deps` only (saves ~90 s × every job).
- **PR comment** — `actions/github-script` posts a pass/fail/flaky/skipped/duration
  table with per-failure list and links to the merged report. Updates the existing
  comment instead of spamming.
- **Cross-browser nightly** — firefox + webkit smoke runs scheduled-only, never on PRs.
- **`@quarantine` job** — non-blocking, runs known-flaky tests; auto-skipped when no
  quarantined tests are tagged.

### `security.yml` — security gates

```
codeql                            (every push + PR + weekly)
npm-audit                         (high-severity prod vulns block)
dependency-review                 (PR only — blocks new high-severity transitives)
gitleaks                          (every push + PR)
zap-scan                          (scheduled + manual only — baseline passive scan)
```

### `lighthouse.yml` — performance budgets

```
lighthouse                        (every PR + manual — perf 0.85, a11y 0.90, BP 0.90)
```

Score thresholds in [`lighthouserc.yml`](lighthouserc.yml). Adjust to your app's
baseline, then tighten over time.

---

## Environment Variables

```bash
# .env.example — copy to .env.local, never commit .env.local
BASE_URL=https://www.saucedemo.com              # required
TEST_USER_USERNAME=standard_user                # required
TEST_USER_PASSWORD=secret_sauce                 # required — saucedemo default
API_KEY=                                        # optional
SLACK_WEBHOOK_URL=                              # optional
LHCI_GITHUB_APP_TOKEN=                          # optional (LHCI GitHub status)

# Jira integration (required for jira-qa-runner agent)
JIRA_BASE_URL=https://your-org.atlassian.net   # no trailing slash
JIRA_EMAIL=qa-bot@your-org.com
JIRA_API_TOKEN=                                # rotate every 90 days
JIRA_PROJECT_KEY=QA
```

### Runtime knobs

| Variable                                    | What it does                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `BASE_URL`                                  | Target app URL — must start with `http(s)://`, no trailing slash               |
| `TEST_USER_USERNAME` / `TEST_USER_PASSWORD` | Credentials used by the worker auth fixture                                    |
| `PW_KEEP_AUTH=1`                            | Skip the start-of-run wipe of `.auth/user-*.json` (local debugging)            |
| `PW_DISABLE_VIDEO=1`                        | Set `video: 'off'` (useful when ffmpeg can't install)                          |
| `PW_CHROMIUM_CHANNEL=chrome`                | Use system-installed Chrome instead of Playwright's chromium                   |
| `CI`                                        | Auto-set by GitHub Actions — toggles retries, workers, reporter, teardown wipe |
| `JIRA_BASE_URL`                             | Jira Cloud URL — required for `jira-qa-runner` agent                           |
| `JIRA_EMAIL`                                | Service account email for Jira Basic auth                                      |
| `JIRA_API_TOKEN`                            | Jira API token — never commit; rotate every 90 days                            |
| `JIRA_PROJECT_KEY`                          | Project key where auto-defects are filed (e.g. `QA`)                           |
| `ENV_CHECK_TIMEOUT_MS`                      | Override 5-min default for environment readiness polling                       |

---

## Scripts

```bash
npm test                    # full suite, all browsers
npm run test:smoke          # @smoke only — chromium
npm run test:regression     # @regression only — chromium
npm run test:api            # API tests — chromium
npm run test:a11y           # accessibility — chromium
npm run test:visual         # visual diffs — chromium
npm run test:visual:update  # regenerate visual baselines — chromium
npm run test:ui             # Playwright UI mode (interactive)
npm run test:debug          # Playwright Inspector (step through)
npm run test:headed         # full suite, browser visible
npm run report              # open last HTML report
npm run report:merge        # merge sharded blob reports
npm run typecheck           # tsc --noEmit
npm run lint                # eslint
npm run lint:fix            # eslint --fix
npm run format              # prettier --write
npm run format:check        # prettier --check
npm run audit               # npm audit --omit=dev --audit-level=high
npm run clean               # remove reports, test-results, .auth
```

---

## Pre-commit hooks

`husky` + `lint-staged` are wired automatically via `npm install` (`prepare: husky`).

```
.husky/pre-commit  →  lint-staged    (eslint --fix + prettier --write on staged files)
.husky/pre-push    →  npm run typecheck
```

To skip in an emergency, use `git commit --no-verify` — but the CI `lint` job will catch
you. Don't make this a habit.

---

## Adapting to Your App

See [`TODO.md`](TODO.md) for the full checklist. Five-minute version:

| Change                 | Where                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| Target URL             | `.env.local` → `BASE_URL`                                              |
| Credentials            | `.env.local` → `TEST_USER_USERNAME` + `TEST_USER_PASSWORD`             |
| Login flow             | `src/fixtures/base.fixture.ts` → `workerStorageState` fixture          |
| Test ID attribute      | `playwright.config.ts` → `use.testIdAttribute` (currently `data-test`) |
| Page objects           | Adapt or replace `src/pages/*.ts`                                      |
| Test data              | Update `test-data/*.json` + zod schemas in `src/utils/testData.ts`     |
| Factories              | Update `src/factories/*.ts`                                            |
| Performance thresholds | `lighthouserc.yml`                                                     |
| CI secrets             | GitHub Settings → Secrets and variables → Actions                      |
| Code owners            | `.github/CODEOWNERS`                                                   |
| Slack channel          | Slack app settings, not this repo                                      |
| Jira project keys      | `docs/contacts.md` + `JIRA_PROJECT_KEY` env var                        |

Add new page objects as your app grows. Keep `@smoke` small — if it takes more than
2 minutes, split into `@regression`.

---

## Using with Claude Code

This template ships with full [Claude Code](https://claude.ai/code) support.

### Playwright MCP — AI-driven browser

[`.mcp.json`](.mcp.json) configures `@playwright/mcp` so Claude can drive a real browser
while you work. Claude can:

- Navigate to any page in your app and inspect the live DOM
- Discover stable locators (`getByRole`, `getByLabel`, `getByTestId`)
- Take screenshots for visual baseline review
- Reproduce a failing test step by step

**Default is headless** (`--headless` in `.mcp.json`). Remove that flag to run headed.

### Jira MCP — AI-driven ticket operations

[`.mcp.json`](.mcp.json) also configures `mcp-atlassian` for agent-native Jira operations.
Requires Python + uv (`pip install uv` or `brew install uv`) and `JIRA_*` vars in `.env.local`.

Claude can:

- Read a Jira ticket's acceptance criteria and generate tests from it
- Search for existing open defects before creating new ones
- File `[AUTO]` bug tickets when tests fail and can't be self-healed
- Link defects back to the source feature ticket

### Agents · skills · commands

The `agents/`, `skills/`, and `commands/` folders define how Claude approaches tasks in
this repo:

| Folder      | Purpose                | Examples                                                                                                                    |
| ----------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `agents/`   | Role-shaped agents     | `test-writer`, `triage`, `pom-builder`, **`jira-qa-runner`**                                                                |
| `skills/`   | Atomic capabilities    | `write-test`, `create-page-object`, `generate-locator`, `analyze-failure`, `run-tests`, **`pull-jira-ticket`**, **`self-heal-test`**, **`create-jira-defect`** |
| `commands/` | Step-by-step playbooks | `test`, `smoke`, `lint`, `update-snapshots`, `new-page`, **`jira-qa-run`**, **`check-environment`**                         |

#### When to use which

| Task | Use |
|------|-----|
| Write tests from a feature description | `agents/test-writer.md` |
| Debug a failing or flaky test | `agents/triage.md` |
| Create a new Page Object | `agents/pom-builder.md` |
| Pull a Jira ticket → generate tests → run → report → file defect | `agents/jira-qa-runner.md` |
| Quick smoke check | `commands/smoke.md` |
| Full test run | `commands/test.md` |
| Poll environment until ready | `commands/check-environment.md` |
| End-to-end Jira QA cycle | `commands/jira-qa-run.md` |

Full reference: [`CLAUDE.md`](CLAUDE.md).

### Jira QA Runner — automated ticket-to-defect pipeline

The `jira-qa-runner` agent automates the full QA lifecycle for a Jira ticket:

```
Ticket PROJ-123
  → extract acceptance criteria
  → generate Playwright test file(s)
  → wait for environment to be ready
  → run tests
  → if failing: attempt one self-heal (selector/timing only)
  → write run report to reports/runs/YYYY-MM-DD-PROJ-123.md
  → if still failing: create [AUTO] Jira defect (with dedup check)
  → store selector/flake patterns to memory
```

To use it, invoke the agent with a ticket ID:
```
Use agents/jira-qa-runner to run the QA cycle for PROJ-123
```

See [`commands/jira-qa-run.md`](commands/jira-qa-run.md) for the step-by-step runbook
and [`docs/contacts.md`](docs/contacts.md) for team escalation paths.

---

## Documentation

- [`GETTING_STARTED.md`](GETTING_STARTED.md) — zero-to-CI onboarding walkthrough
- [`CLAUDE.md`](CLAUDE.md) — coding standards, agent rules, POM patterns, security
- [`SECURITY.md`](SECURITY.md) — secret handling, threat model, reporting
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — PR workflow + coding standards
- [`TODO.md`](TODO.md) — adapt-the-template checklist
- [`docs/flake-handling.md`](docs/flake-handling.md) — flake taxonomy + playbook
- [`docs/contacts.md`](docs/contacts.md) — team contacts, Jira keys, escalation, token rotation
- [`tests/visual/README.md`](tests/visual/README.md) — baseline-per-browser convention

---

## License

[MIT](LICENSE).
