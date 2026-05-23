# Skill: Self-Heal Test

## Purpose

Given a triage finding classified as `Test bug` or `Flake`, attempt one minimal code fix and explain what was changed. Cap strictly at one attempt.

---

## When to Use

- Only called by `jira-qa-runner` agent after `analyze-failure` classifies a failure as `Test bug` or `Flake`
- Never called for `App bug`, `Environment`, or `Visual drift` categories — those require human decisions

---

## Input

| Field | Required | Description |
|-------|----------|-------------|
| Triage finding | Yes | Full 4-part output from `analyze-failure` skill (Category, Root cause, Evidence, Fix) |
| Test file path | Yes | Path to the failing `.spec.ts` file |
| POM file path | No | Path to relevant page object if the fix is a locator change in the POM |

---

## Allowed Fixes

| Failure signal | Allowed fix |
|----------------|-------------|
| `Element is not visible` / stale locator | Replace with semantic locator: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByTestId` |
| `Timeout waiting for` + a navigation | Add `await page.waitForURL(...)` or `await expect(locator).toBeVisible()` |
| `Timeout waiting for` + an element | Switch to `expect.poll(() => ...).toBe(...)` pattern from `docs/flake-handling.md` |
| Race condition (intermittent pass) | Add `await page.waitForResponse('**/api/...')` before the assertion |

## Out of Scope — Stop Immediately

Do NOT attempt self-heal for any of these. Return `category: out-of-scope` and stop:

- `Expected true to equal false` or similar logic failures — the test asserts the wrong thing
- Auth failures — credentials, storage state, session expiry
- Environment failures — network errors, `BASE_URL` mismatch
- Visual diff failures — screenshot comparison
- Failures that require changing `test-data/` JSON, factories, or fixtures
- Failures where the fix requires understanding application business logic

---

## Process

**Step 1 — Confirm the category is in scope**

Read the triage finding `Category` field. If it is not `Test bug` or `Flake`, return:
```
self-heal: skipped — category "<Category>" is out of scope for automated fix
```

**Step 2 — Read the failing file**

Read the test file (and POM if locator is in the POM). Locate the exact line from the triage `Evidence` field.

**Step 3 — Apply the minimal fix**

Match the failure signal to the allowed fixes table. Apply the smallest possible change:
- Change one locator → do not restructure the whole POM
- Add one explicit wait → do not add multiple waits
- Do not rename methods, reorganize imports, or add unrelated cleanup

**Step 4 — Verify the fix does not introduce anti-patterns**

Before writing:
- No `waitForTimeout` introduced
- No CSS class selectors introduced (`.btn-primary`)
- No XPath introduced
- No `any` type introduced

**Step 5 — Write the fix and report it**

Apply the change. Then output:

```
self-heal: attempt 1/1
file: <path>
change: <one sentence — what was replaced and why>
category: selector | timing | out-of-scope
```

Example:
```
self-heal: attempt 1/1
file: src/pages/LoginPage.ts:12
change: Replaced page.locator('.btn-primary') with page.getByRole('button', { name: 'Login' }) — CSS selector broke after UI refactor
category: selector
```

---

## Constraints

- One attempt only — never loop or retry the fix
- Only modify the test file or its corresponding POM — no other files
- If uncertain whether the fix is in scope, classify as `out-of-scope` and stop
- The fix must match the triage `Fix` field — do not invent an alternative approach
- Report the self-heal result to `write-run-report` regardless of outcome
