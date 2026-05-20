# TODO — Adapt the Template to Your App

The template ships working out of the box against [saucedemo.com](https://www.saucedemo.com).
This file is your checklist for swapping in your own application.

---

## Phase 1 — Verify the baseline works `~10 min`

- [ ] **Install dependencies**

  ```bash
  npm install
  npx playwright install --with-deps chromium
  ```

- [ ] **Run smoke tests against the default saucedemo target**

  ```bash
  npm run test:smoke
  ```

  Login + inventory smoke tests should pass green. If they don't, your network can't reach
  saucedemo.com — check connectivity before continuing.

- [ ] **Run typecheck + lint**
  ```bash
  npm run typecheck && npm run lint
  ```

---

## Phase 2 — Point at your app `~30 min`

- [ ] **Set target URL and credentials**

  ```bash
  cp .env.example .env.local
  # edit .env.local — BASE_URL, TEST_USER_USERNAME, TEST_USER_PASSWORD
  ```

- [ ] **Adapt `src/fixtures/global.auth.setup.ts`** to your app's login flow
  - Update the selectors / URLs to match your login page
  - The default flow targets saucedemo's `getByTestId('username')` and `getByTestId('login-button')`

- [ ] **Adapt or replace the page objects in `src/pages/`**
  - `LoginPage.ts`, `InventoryPage.ts`, `CartPage.ts`, `CheckoutInfoPage.ts`,
    `CheckoutOverviewPage.ts`, `CheckoutCompletePage.ts` are saucedemo-specific.
  - Keep the patterns: private locators, no `expect()` inside POMs, `waitForLoad()` method.

- [ ] **Replace `test-data/users.json` and `test-data/products.json`** with your data shape.
      Update `src/utils/testData.ts` to match.

- [ ] **Run the smoke suite against your app**
  ```bash
  npm run test:smoke
  ```

---

## Phase 3 — Expand coverage `ongoing`

### Smoke — `tests/smoke/` (must stay under 2 min total)

- [ ] Login + reach the main page
- [ ] Core paid feature works end-to-end
- [ ] Key API endpoint returns 200

### Regression — `tests/regression/` (nightly)

- [ ] Form validation
- [ ] Error and empty states
- [ ] Permissions / roles
- [ ] Multi-step flows like checkout (see `checkout.regression.spec.ts` for the pattern)

### API — `tests/api/`

- [ ] Core CRUD endpoints
- [ ] Auth failure paths

### Accessibility — `tests/accessibility/`

- [ ] Login + main pages

### Visual — `tests/visual/`

- [ ] Login + main pages — generate and commit initial baselines:
  ```bash
  npm run test:visual:update
  git add tests/visual/**/*.png
  ```

---

## Phase 4 — CI Setup `~1 hour`

GitHub Actions workflows are ready. The smoke job will run against saucedemo with no
secrets configured — the workflow falls back to public defaults so the template stays
green out of the box.

### Switch CI to your app

Add these GitHub repository secrets (**Settings → Secrets and variables → Actions**):

| Secret                  | Required                                   |
| ----------------------- | ------------------------------------------ |
| `BASE_URL`              | Yes — your staging URL                     |
| `TEST_USER_USERNAME`    | Yes                                        |
| `TEST_USER_PASSWORD`    | Yes                                        |
| `SLACK_WEBHOOK_URL`     | Optional — for Slack notifications         |
| `LHCI_GITHUB_APP_TOKEN` | Optional — for Lighthouse PR status checks |

Once set, the next CI run will use your secrets in place of the saucedemo defaults.

### Validate

- [ ] Open a PR — confirm `ci.yml`, `security.yml`, and `lighthouse.yml` trigger
- [ ] Confirm the smoke matrix passes (2 sharded jobs)
- [ ] Confirm the merged HTML report uploads as an artifact
- [ ] Enable **Dependabot** in **Settings → Code security → Dependabot**

---

## Phase 5 — Ongoing Maintenance

- [ ] **Smoke is a blocker** — a failing `@smoke` on `main` is a production-incident-level
      event
- [ ] **Review Dependabot PRs weekly** — run `npm run test:smoke` locally, merge if green
- [ ] **Update visual baselines deliberately** — never silence a diff without reviewing
- [ ] **Audit smoke speed monthly** — if smoke exceeds 2 minutes, move tests to regression
- [ ] **Add smoke coverage for every new critical feature**
