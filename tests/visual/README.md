# Visual Baselines

Playwright generates one baseline PNG per `(browser, OS)` combination. A test that
asserts `expect(page).toHaveScreenshot('login.png')` looks up the baseline at
`login.visual.spec.ts-snapshots/login-<browser>-<os>.png`.

## Per-browser-per-OS convention

| Project           | Baseline filename pattern |
| ----------------- | ------------------------- |
| chromium on Linux | `*-chromium-linux.png`    |
| chromium on macOS | `*-chromium-darwin.png`   |
| firefox on Linux  | `*-firefox-linux.png`     |
| webkit on Linux   | `*-webkit-linux.png`      |

This is fine because:

- Anti-aliasing differs across browsers and OSes — one baseline that "works for all" is
  a fantasy.
- Each baseline is small (a few hundred KB).
- They live in git so reviewers can see diffs.

## Generating baselines

```bash
# All projects
npm run test:visual:update

# Single project
npx playwright test --grep @visual --project=chromium --update-snapshots
npx playwright test --grep @visual --project=firefox  --update-snapshots
npx playwright test --grep @visual --project=webkit   --update-snapshots
```

Commit the resulting PNGs alongside the test change. Always review the diff image-by-image
before committing — never `git add -A` blindly.

## When tests fail in CI

1. Download the workflow artifact (HTML report).
2. Open the visual test in the report — Playwright shows **Expected**, **Actual**, and
   **Diff** side by side.
3. If the diff is intentional (UI redesign, brand refresh): update the baseline locally
   and commit. Use `npm run test:visual:update`.
4. If the diff is unintentional: that's a regression — the failing test is doing its job.
   Investigate the app, not the test.

## Masking dynamic content

Anything that legitimately changes (timestamps, user avatars, ads, animated badges)
should be masked, not have the baseline updated repeatedly:

```typescript
await expect(page).toHaveScreenshot('inventory.png', {
  maxDiffPixels: 150,
  mask: [page.getByTestId('shopping-cart-badge'), page.getByTestId('last-updated')],
});
```

## CI strategy

- **Chromium baselines** run on every PR (blocking).
- **Firefox + webkit baselines** run nightly only (cross-browser confirmation, slower).

This avoids regenerating six baselines every time a designer changes one pixel.
