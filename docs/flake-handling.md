# Flake Handling

A flaky test passes sometimes and fails other times with no code change. Flakes erode
trust in the suite — if green doesn't mean "safe to ship," the suite is broken.

## The three tools

### 1. `expect.poll` — for assertions that depend on state that converges

```typescript
// Wrong — single read of a value that takes time to settle
expect(await api.getStatus()).toBe('ready');

// Right — polls until the predicate holds or the timeout expires
await expect.poll(() => api.getStatus(), { timeout: 10_000 }).toBe('ready');
```

### 2. `test.slow()` — for genuinely slow tests

Triples the default timeout for one specific test. Do **not** raise the global timeout to
accommodate a single slow test.

```typescript
test('uploads a 50MB file @regression', async ({ page }) => {
  test.slow();
  // ...
});
```

### 3. `@quarantine` tag — for known-flaky tests you can't fix today

Tag the test, log a ticket to fix it, run it as a separate non-blocking CI job. The test
keeps running so the flake doesn't get worse, but it doesn't block merges.

```typescript
test('checkout splits cart correctly @regression @quarantine', async ({ page }) => {
  // TODO(ABC-123): cart split flakes ~5% — investigate timing
});
```

The CI `quarantine` job (`.github/workflows/ci.yml`) runs `--grep @quarantine` with
`continue-on-error: true`, so failures surface as warnings and never block merges.

## When to do what

| Symptom                                                   | Tool                                       |
| --------------------------------------------------------- | ------------------------------------------ |
| Assertion flakes because the state takes time to converge | `expect.poll`                              |
| Test is just slow (uploads, video, large data)            | `test.slow()`                              |
| Race condition you understand but can't fix this sprint   | `@quarantine` + ticket                     |
| Test passes locally, fails in CI consistently             | **Not a flake** — environment issue        |
| Test fails on retry but passes after a re-run             | Real flake — investigate, don't quarantine |

## Anti-patterns

- **Adding retries to mask flake** — the default `retries: 2` exists to absorb genuine
  infrastructure blips, not to compensate for race conditions. If a test only passes on
  retry, fix the test.
- **Increasing `waitForTimeout`** — `waitForTimeout` itself is the smell. Replace with
  `expect.poll`, `waitForResponse`, or `expect(locator).toBeVisible()`.
- **Skipping a test instead of quarantining** — skipped tests are dead. Quarantined tests
  are alive and visible.

## Triage workflow

1. Open the Playwright HTML report → find the failing test.
2. Inspect the trace (`test-results/<test>/trace.zip` via `npx playwright show-trace`).
3. Identify the step that varies between runs.
4. Apply the matching tool above.
5. If you can't fix in 30 minutes: tag `@quarantine`, file a ticket, link the ticket in
   a `// TODO` comment.
