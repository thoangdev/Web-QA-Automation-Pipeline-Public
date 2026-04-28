# Command: test

Run the full test suite with reporting. Use this before a release, after a large refactor, or when you want a complete picture of suite health.

---

## Prerequisites

- `BASE_URL` is set in `.env.local`
- Playwright browsers are installed (`npx playwright install --with-deps`)
- Auth setup has run at least once (`.auth/user.json` exists)

---

## Steps

**1. Verify environment**

```bash
grep BASE_URL .env.local
```

Stop if `BASE_URL` is empty or missing. Set it before proceeding.

**2. Run all tests on chromium**

```bash
npx playwright test --project=chromium
```

**3. If any tests fail, open the report**

```bash
npx playwright show-report
```

Look at the failed tests. For trace-enabled failures, the trace viewer link is in the report.

**4. For a specific failure with a trace**

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

**5. Run across all browsers (for release gates only)**

```bash
npx playwright test
```

---

## Expected Output

```
Running X tests using Y workers

  ✓ smoke/login.smoke.spec.ts (1.2s)
  ✓ smoke/dashboard.smoke.spec.ts (0.8s)
  ✓ api/users.api.spec.ts (0.4s)
  ...

  X passed (Xs)
```

Any failures print the error and file location inline.

---

## Options

```bash
# With video recorded for all tests (not just failures)
npx playwright test --project=chromium --video on

# With browser visible
npx playwright test --headed --project=chromium

# Limit to 2 workers to reduce parallelism
npx playwright test --project=chromium --workers 2
```

---

## When to Use

| Situation | Use instead |
| --- | --- |
| Quick check after a single change | `commands/smoke.md` |
| Debugging one failing test | `--debug` flag |
| Pre-release full cross-browser | `npx playwright test` (no `--project`) |
