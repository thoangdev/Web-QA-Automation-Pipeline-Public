# Skill: Run Tests

## Purpose

Execute the Playwright test suite in the correct mode for the current task and surface the results.

---

## When to Use

- Verifying that a new or fixed test passes
- Running a quick smoke check after a change
- Running the full suite before a release
- Reproducing a flaky test

---

## Input

| Field | Default | Options |
| --- | --- | --- |
| Scope | all tests | tag, folder, file name, test name |
| Browser | chromium | chromium, firefox, webkit, all |
| Mode | headless | headed, debug, UI |
| Retries | per config | override with `--retries` |

---

## Commands

```bash
# Smoke — fastest feedback (~2 min)
npx playwright test --grep @smoke --project=chromium

# Specific file
npx playwright test tests/smoke/login.smoke.spec.ts --project=chromium

# Specific test by name
npx playwright test --grep "user can log in" --project=chromium

# By folder
npx playwright test tests/api/ --project=chromium

# All tests, chromium only
npx playwright test --project=chromium

# All tests, all browsers
npx playwright test

# Headed — see the browser
npx playwright test --headed --project=chromium

# Debug — step through interactively
npx playwright test --debug tests/smoke/login.smoke.spec.ts

# UI mode — interactive runner
npx playwright test --ui

# Reproduce a flaky test
npx playwright test --repeat-each 5 tests/smoke/login.smoke.spec.ts --project=chromium

# Open last report
npx playwright show-report

# Open a trace
npx playwright show-trace test-results/<test>/trace.zip
```

---

## Output

Tests produce:
- Terminal pass/fail summary
- HTML report at `reports/html/` — open with `npx playwright show-report`
- Trace files at `test-results/` on failure (when `trace: 'on-first-retry'` is set)
- Screenshots at `test-results/` on failure (when `screenshot: 'only-on-failure'` is set)

---

## Decision Guide

| Situation | Command to use |
| --- | --- |
| After any code change, quick check | `--grep @smoke --project=chromium` |
| Before pushing a branch | `--grep "@smoke\|@api" --project=chromium` |
| Debugging a specific failure | `--debug` on the failing file |
| Exploring interactively | `--ui` |
| Reproducing flake | `--repeat-each 5` on the flaky file |
| Pre-release full check | `npx playwright test` (all browsers) |
| Writing a new test | `--headed` to see the browser |

---

## Constraints

- Always specify `--project=chromium` unless cross-browser coverage is the explicit goal
- Do not run `@visual` tests unless you intend to compare or update baselines
- Do not use `--workers 1` unless debugging a shared-state race condition — it disables parallelism and slows everything down
- Ensure `BASE_URL` is set in `.env.local` before running E2E tests
- Never point tests at a production environment

---

## Safety

If `BASE_URL` is not set, tests will hit `undefined` as the base URL and fail with `net::ERR_NAME_NOT_RESOLVED`. Always verify:

```bash
grep BASE_URL .env.local
```
