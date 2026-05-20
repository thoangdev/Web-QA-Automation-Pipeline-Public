# Command: update-snapshots

Regenerate visual baseline screenshots after a deliberate UI change. Do not run this to silence a failing visual test without first understanding why it failed.

---

## When to Use

Only after a **confirmed, intentional** UI change — a redesign, new component, layout shift, or brand update that you have already reviewed and approved.

Do not run this if:

- You don't know why the visual test failed
- The failure is intermittent
- The change was not intentional

---

## Steps

**1. Run visual tests to see current diffs**

```bash
npx playwright test --grep @visual --project=chromium
```

**2. Open the report and review every diff**

```bash
npx playwright show-report
```

For each failing test: inspect the "Expected", "Actual", and "Diff" images. Confirm the change is intentional before proceeding.

**3. Update the baselines**

```bash
npx playwright test --update-snapshots --grep @visual --project=chromium
```

**4. Verify the new baselines look correct**

```bash
npx playwright test --grep @visual --project=chromium
npx playwright show-report
```

All visual tests should pass (0 diffs) after the update.

**5. Commit the updated snapshots**

```bash
git add tests/visual/__snapshots__/
git commit -m "chore: update visual baselines — <describe what changed>"
```

The commit message must describe what changed in the UI (e.g., "update visual baselines — new button color from brand refresh").

---

## Files Changed

Snapshots live in `tests/visual/__snapshots__/`. Each `.png` file is a committed baseline. The diff between old and new will be visible in the git diff.

---

## Constraints

- Always run on `--project=chromium` only — baselines are browser and OS-specific
- Never commit baseline changes without reviewing the diffs first
- If a visual test fails in CI without a local UI change, investigate before updating (likely a flake caused by a dynamic element not being masked)

---

## Masking Dynamic Content

If visual tests are failing intermittently due to content that legitimately changes (timestamps, user avatars, ads, animated elements), add a mask — do not update the baseline:

```typescript
await expect(page).toHaveScreenshot('page.png', {
  maxDiffPixels: 100,
  mask: [page.locator('[data-testid="user-avatar"]'), page.locator('[data-testid="last-updated"]')],
});
```
