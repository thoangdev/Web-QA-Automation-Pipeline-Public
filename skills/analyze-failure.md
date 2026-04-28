# Skill: Analyze Failure

## Purpose

Read Playwright test output, JSON results, or trace artifacts and identify the root cause of a failure with a specific, actionable fix.

---

## When to Use

- A test is failing in CI or locally and the cause is not obvious
- A test is intermittently flaky
- A visual diff failed unexpectedly
- An accessibility scan found violations
- CI passes locally but fails in GitHub Actions

---

## Input

Provide one or more of:

| Input | Where to find it |
| --- | --- |
| Terminal error output | Test run stdout |
| JSON results | `reports/results.json` |
| HTML report | `reports/html/index.html` — open with `npx playwright show-report` |
| Trace file | `test-results/<test-name>/trace.zip` — open with `npx playwright show-trace` |
| Failing test name and file | Shown in error output |
| Screenshot diff image | Attached to the HTML report for `@visual` failures |

---

## Output

A structured triage finding with all four parts:

```
Category:   [test bug | app bug | environment | flake | visual drift]
Root cause: [one sentence]
Evidence:   [exact error message, selector, or line number]
Fix:        [exact code change or action to take]
```

---

## Process

**Step 1 — Read the error message**
Identify the exact assertion or locator call that failed. Note the file and line number.

**Step 2 — Classify the failure**

| Category | Key signals |
| --- | --- |
| Test bug | `Locator not found`, `Expected ... to equal ...`, selector stale after UI refactor |
| App bug | Unexpected page content, wrong HTTP status, feature not working as specified |
| Environment | Passes locally, fails in CI; missing `BASE_URL`; auth session expired |
| Flake | Intermittent, no code change triggered it, often a timing or data isolation issue |
| Visual drift | `Screenshot comparison failed`, `maxDiffPixels exceeded` |

**Step 3 — Investigate based on category**

- **Test bug → selector failure:**
  Look up the locator in `src/pages/`. Check if the element's role, label, or text has changed.
  Apply `generate-locator` skill to find the correct replacement.

- **Test bug → assertion failure:**
  Read what was expected vs. what was received. Check if the app behavior changed (app bug) or the assertion was wrong (test bug).

- **Environment:**
  Check `.env.local` vs GitHub secrets. Check if the `setup` auth project ran. Check `BASE_URL` protocol/domain.

- **Flake:**
  Look for missing `await`, race conditions between UI and API, or shared test data that another test modified.
  Typical fix: add `await page.waitForResponse('**/api/...')` or use unique per-test data.

- **Visual drift:**
  Open the HTML report and inspect the diff image. Identify what changed.
  Ask the user: is this intentional? If yes → run `commands/update-snapshots.md`. If no → investigate the app.

- **Accessibility violation:**
  Report the rule ID, impact level, and the specific HTML element that failed.
  Provide the fix in the app's HTML (e.g., add `aria-label`, associate a `<label>`, fix color contrast).

**Step 4 — Output the finding**

---

## Constraints

- Do not fix app bugs — report them clearly and stop
- Do not update visual baselines without explicit user confirmation
- Do not guess at the root cause — if evidence is insufficient, ask for the trace or screenshot
- Do not surface credential values, cookie contents, or auth tokens from traces in output

---

## Common Patterns and Fixes

| Error message | Likely cause | Fix |
| --- | --- | --- |
| `locator.click: Element is not visible` | Stale CSS selector | Replace with `getByRole` or `getByTestId` |
| `Timeout waiting for ...` | Missing explicit wait | Add `waitForURL`, `waitForResponse`, or `expect(...).toBeVisible()` |
| `expect(received).toBe(expected)` with wrong value | App behavior changed | Check if app bug; if test assertion wrong, fix the expected value |
| `Screenshot comparison failed` | UI changed | Inspect diff in report; confirm with user before updating |
| `storageState file not found` | Auth setup project did not run | Verify `dependencies: ['setup']` in `playwright.config.ts` projects |
| `net::ERR_NAME_NOT_RESOLVED` | Wrong `BASE_URL` | Check `.env.local` and GitHub Actions secret |
