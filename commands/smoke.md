# Command: smoke

Run the smoke suite only. Use this for fast validation after any change. Should complete in under 2 minutes.

---

## Prerequisites

- `BASE_URL` is set in `.env.local`

---

## Steps

**1. Run smoke + api tests**

```bash
npx playwright test --grep "@smoke|@api" --project=chromium
```

**2. On failure, open the report**

```bash
npx playwright show-report
```

---

## Expected Output

```
Running X tests using Y workers

  ✓ smoke/login.smoke.spec.ts (1.1s)
  ✓ smoke/dashboard.smoke.spec.ts (0.9s)
  ✓ api/users.api.spec.ts (0.3s)
  ...

  X passed (Xs)
```

If this takes more than 2 minutes, some tests tagged `@smoke` are too slow and should be moved to `@regression`.

---

## When to Use

- After any code change, before pushing
- Quick sanity check against staging
- As a first step when debugging — confirm the baseline is green before investigating further

---

## Scope Variants

```bash
# Smoke only (no API tests)
npx playwright test --grep @smoke --project=chromium

# Single smoke file
npx playwright test tests/smoke/login.smoke.spec.ts --project=chromium

# Smoke with browser visible
npx playwright test --grep @smoke --headed --project=chromium
```

---

## If Smoke Starts Taking Too Long

Smoke tests must stay under 30 seconds each. If the suite creeps past 2 minutes:

1. Run with timing: `npx playwright test --grep @smoke --project=chromium`
2. Identify the slowest tests from the report
3. Move them from `tests/smoke/` to `tests/regression/` and change their tag to `@regression`
