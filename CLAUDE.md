# CLAUDE.md — Playwright QA Template

## Project Summary

This is a lean, SaaS-focused QA automation template built on Playwright and TypeScript. It is designed to be cloned and adapted — not a framework you import, but a starting point you own. It covers E2E, API, visual, accessibility, and smoke testing from a single toolchain.

The project has no runtime application code. Every file here is either a test, a test helper, or configuration. Claude's role in this repo is to write, fix, and maintain test code — not to build product features.

---

## Architecture

### Layer model

```
tests/           ← assertions only — no implementation logic
src/pages/       ← Page Object Model: UI interactions per page
src/components/  ← sub-page objects: shared UI pieces (nav, modals)
src/api/         ← thin REST wrappers for test setup/teardown only
src/fixtures/    ← Playwright test extensions (auth, shared state)
src/utils/       ← pure helpers: random data, date formatting, waits
test-data/       ← static JSON payloads and seed files
```

Tests call page objects and fixtures. Tests never interact with raw Playwright locators directly (except trivial one-off smoke tests where a POM would be overkill).

### Test types and where they live

| Type | Folder | Tag | Run frequency |
| --- | --- | --- | --- |
| Critical path | `tests/smoke/` | `@smoke` | Every push |
| Full coverage | `tests/regression/` | `@regression` | Nightly + release |
| REST contracts | `tests/api/` | `@api` | Every push |
| WCAG audits | `tests/accessibility/` | `@a11y` | Every PR + nightly |
| Screenshot diffs | `tests/visual/` | `@visual` | Every PR (non-blocking) |

### Auth flow

Auth state is saved once via the `setup` project in `playwright.config.ts` and reused across tests via `storageState`. The saved session lives in `.auth/user.json` (gitignored). Tests that need a fresh unauthenticated context create their own browser context.

---

## Coding Standards

### Selectors — always prefer semantic locators

Use in this order — stop at the first one that works:

```
1. getByRole()          accessible name + role (buttons, links, headings)
2. getByLabel()         form fields with <label>
3. getByPlaceholder()   inputs with placeholder text
4. getByText()          visible text content
5. getByTestId()        data-testid attribute (when semantics are absent)
```

**Never use:** CSS classes, XPath, positional selectors (`nth(2)`) without a `data-testid`.

If no semantic selector exists, the correct fix is to add `data-testid` to the frontend — not to write a fragile CSS selector.

### Waiting — never use `waitForTimeout`

```typescript
// Wrong — hides real timing issues
await page.waitForTimeout(2000);

// Right — wait for something specific
await expect(locator).toBeVisible();
await page.waitForURL('/dashboard');
await page.waitForResponse('**/api/orders');
```

Playwright's locators auto-wait up to the configured timeout. A `waitForTimeout` is always a sign of a missing proper wait.

### Test structure — Arrange → Act → Assert

```typescript
test('user can create a project @regression', async ({ page }) => {
  // Arrange
  const dashboard = new DashboardPage(page);
  await dashboard.goto('/dashboard');

  // Act
  await dashboard.createProject('Test project');

  // Assert
  await expect(page.getByText('Test project')).toBeVisible();
});
```

### Page Objects

- Extend `BasePage` for all page-level classes
- Locators are **private** class fields — never exposed
- Methods are actions, named for user intent: `login()`, `createProject()`, `submitForm()`
- No `expect()` calls inside page objects — assertions belong in tests
- Methods do not need to return values unless the caller needs them for chaining

### Fixtures

- Prefer fixtures over `beforeEach` for shared setup — they compose, `beforeEach` doesn't
- Auth state: `storageState: '.auth/user.json'` in the `playwright.config.ts` project definition
- Import `test` from `src/fixtures/base.fixture.ts` (not `@playwright/test`) in any test that uses shared fixtures

### Tags

- Every test must have at least one tag, embedded in the title: `'description @tag'`
- `@smoke` tests: under 30 seconds each, under 2 minutes for the full suite
- A test can have multiple tags: `'checkout completes @smoke @regression'`

### File and class naming

| What | Convention | Example |
| --- | --- | --- |
| Page object files | PascalCase | `DashboardPage.ts` |
| Test files | kebab-case + type suffix | `dashboard.smoke.spec.ts` |
| Component files | PascalCase | `NavBar.ts` |
| API wrapper files | PascalCase | `OrdersApi.ts` |
| Utility files | camelCase | `randomData.ts` |

---

## Agent Behavior Rules

When writing or editing any file in this project:

1. **Check `src/pages/` first.** Use an existing page object before creating a new one.
2. **Use the fixture.** Import from `src/fixtures/base.fixture.ts` if the test needs auth or a shared page object.
3. **Tag every test.** No untagged tests — ever.
4. **No raw timeouts.** Replace all `waitForTimeout` with explicit Playwright waits.
5. **No CSS selectors.** Semantic locators only.
6. **Smoke stays small.** Do not add flows that take more than 30 seconds to `tests/smoke/`.
7. **Tests are independent.** Each test creates its own data and does not rely on prior test execution order.
8. **No credentials in code.** Read auth from `process.env.*` only.
9. **Page objects contain no assertions.** If you find an `expect()` in a page object, move it to the test.

---

## Tool and Skill Usage Guidelines

### When to use agents

| Task | Agent |
| --- | --- |
| Write a new test from a feature description | `agents/test-writer.md` |
| Debug a failing or flaky test | `agents/triage.md` |
| Create a new Page Object class | `agents/pom-builder.md` |

### When to use skills

| Task | Skill |
| --- | --- |
| Produce a test file | `skills/write-test.md` |
| Scaffold a POM class | `skills/create-page-object.md` |
| Find the right locator for an element | `skills/generate-locator.md` |
| Analyze a test failure from output or trace | `skills/analyze-failure.md` |
| Execute tests in the right mode | `skills/run-tests.md` |

### When to use commands

| Task | Command |
| --- | --- |
| Run the full suite | `commands/test.md` |
| Quick smoke validation | `commands/smoke.md` |
| Static analysis before committing | `commands/lint.md` |
| Regenerate visual baselines | `commands/update-snapshots.md` |
| Scaffold a new page + tests | `commands/new-page.md` |

---

## File Structure Overview

```
playwright_sample/
├── CLAUDE.md                    ← this file
├── README.md                    ← project overview
├── GETTING_STARTED.md           ← full onboarding guide
│
├── agents/                      ← Claude agent definitions
│   ├── test-writer.md
│   ├── triage.md
│   └── pom-builder.md
│
├── skills/                      ← Claude skill definitions
│   ├── write-test.md
│   ├── create-page-object.md
│   ├── generate-locator.md
│   ├── analyze-failure.md
│   └── run-tests.md
│
├── commands/                    ← Claude command definitions
│   ├── test.md
│   ├── smoke.md
│   ├── lint.md
│   ├── update-snapshots.md
│   └── new-page.md
│
├── .claude/
│   └── settings.json            ← tool permissions
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── security.yml
│   │   └── lighthouse.yml
│   └── dependabot.yml
│
├── src/
│   ├── fixtures/
│   │   └── base.fixture.ts
│   ├── pages/
│   │   ├── BasePage.ts
│   │   └── LoginPage.ts
│   ├── components/
│   ├── api/
│   └── utils/
│
├── tests/
│   ├── smoke/
│   ├── regression/
│   ├── api/
│   ├── accessibility/
│   └── visual/
│
├── test-data/
├── .auth/                       ← gitignored — saved auth sessions
├── reports/                     ← gitignored — generated reports
├── playwright.config.ts
├── lighthouserc.yml
├── tsconfig.json
├── package.json
└── .env.example
```
