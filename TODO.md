# TODO — Complete the Pipeline

Step-by-step checklist to turn this template into a working, CI-connected QA pipeline for your app. Work through each phase in order — Phase 1 to Phase 3 gets you to a running suite in about 2 hours.

---

## Phase 1 — Bootstrap `~30 min`

Get tests running locally before touching anything else.

- [ ] **Install dependencies**
  ```bash
  npm install
  npx playwright install --with-deps
  ```

- [ ] **Set your target URL**
  ```bash
  cp .env.example .env.local
  # Edit .env.local — set BASE_URL=https://your-staging-app.com
  ```

- [ ] **Run the sample smoke tests**
  ```bash
  npx playwright test --grep @smoke --project=chromium
  npx playwright show-report
  ```
  Both tests should pass. If they fail, check `BASE_URL` and network access to your app.

- [ ] **Delete the sample tests** once confirmed working
  ```bash
  rm tests/smoke/example.smoke.spec.ts
  ```

- [ ] **Run typecheck and lint** — confirm zero errors on the base template
  ```bash
  npm run typecheck
  npm run lint
  ```

---

## Phase 2 — Authentication `~1 hour`

Skip if your app has no login. Come back here when you need auth-protected tests.

- [ ] **Adapt `src/fixtures/auth.setup.ts`** to your app's login flow
  - Update the field labels (`Email`, `Password`) to match your form
  - Update the submit button label (`Sign in`)
  - Update the post-login URL (`**/dashboard`)

- [ ] **Uncomment the auth projects** in `playwright.config.ts`
  - Uncomment the `setup` project block
  - Uncomment the auth-enabled `chromium` project (with `storageState` + `dependencies`)
  - Remove or comment out the non-auth `chromium` project above it

- [ ] **Set auth credentials** in `.env.local`
  ```bash
  TEST_USER_EMAIL=qa@your-app.com
  TEST_USER_PASSWORD=your-test-password
  ```

- [ ] **Create the `.auth/` directory**
  ```bash
  mkdir .auth
  ```
  It is gitignored — safe to create locally.

- [ ] **Run auth setup to generate the session**
  ```bash
  npx playwright test --project=setup
  ```
  Verify `.auth/user.json` was created.

- [ ] **Verify auth works** by writing and running one auth-required smoke test
  using the `authedPage` fixture from `src/fixtures/base.fixture.ts`

---

## Phase 3 — Core Test Coverage `ongoing`

Write the tests that matter. Start with smoke, expand from there.

### Smoke Suite — `tests/smoke/`

These must stay fast (under 30 seconds each, under 2 minutes total).

- [ ] Login and reach the main page
- [ ] Core paid feature works end-to-end
- [ ] Main navigation loads without errors
- [ ] Key API endpoint returns 200

### Regression Suite — `tests/regression/`

Runs nightly. Comprehensive, can be slower.

- [ ] Form validation — required fields, format errors
- [ ] Error states and empty states
- [ ] User permissions and role-based access
- [ ] Password reset or signup flow
- [ ] Pagination, sorting, filtering (if applicable)

### API Tests — `tests/api/`

- [ ] Core CRUD endpoints (GET, POST, PUT/PATCH, DELETE)
- [ ] Authenticated endpoint returns 401 without token
- [ ] Invalid input returns 400/422 with error details

### Accessibility — `tests/accessibility/`

- [ ] Login page
- [ ] Main dashboard or home page
- [ ] Most-used form or workflow
- [ ] Any modal or dialog used by most users

### Visual Baselines — `tests/visual/`

- [ ] Home or landing page
- [ ] Main app dashboard
- [ ] Critical UI component (data table, chart, or key form)
- [ ] Generate and commit initial baselines:
  ```bash
  npx playwright test --update-snapshots tests/visual/ --project=chromium
  git add tests/visual/__snapshots__/
  git commit -m "chore: add initial visual baselines"
  ```

---

## Phase 4 — Page Objects `as you write tests`

Create a page object for each page or major flow you automate. One file per page.

- [ ] `src/pages/LoginPage.ts`
- [ ] `src/pages/DashboardPage.ts`
- [ ] `src/pages/<YourCorePage>.ts`
- [ ] `src/components/NavBar.ts` *(if navigation is reused across tests)*

Follow the pattern in [skills/create-page-object.md](skills/create-page-object.md) and use [agents/pom-builder.md](agents/pom-builder.md).

---

## Phase 5 — CI/CD `~1 hour`

All workflow files are already written in `.github/workflows/`. You just need secrets.

### Add GitHub Secrets

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Required for | Notes |
| --- | --- | --- |
| `BASE_URL` | All CI tests | Staging URL, not production |
| `TEST_USER_EMAIL` | Auth tests | Dedicated QA test account |
| `TEST_USER_PASSWORD` | Auth tests | |
| `SLACK_WEBHOOK_URL` | Notifications | See Phase 6 |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI | See Phase 7 |

### Validate CI

- [ ] Push to `main` or open a PR
- [ ] Confirm `ci.yml` triggers in the **Actions** tab
- [ ] Confirm the smoke job passes
- [ ] Download the HTML report artifact and verify it renders correctly
- [ ] Enable **Dependabot** in **Settings → Code security → Dependabot**

---

## Phase 6 — Slack Notifications `~15 min`

- [ ] Create a Slack app and add an Incoming Webhook for your QA channel
  *(Slack docs: api.slack.com/messaging/webhooks)*
- [ ] Add the webhook URL as `SLACK_WEBHOOK_URL` in GitHub secrets
- [ ] Push a change and verify the notification arrives in your channel

---

## Phase 7 — Performance (Lighthouse CI) `~20 min`

- [ ] Create a Lighthouse CI GitHub App token
  *(App: github.com/apps/lighthouse-ci)*
- [ ] Add as `LHCI_GITHUB_APP_TOKEN` in GitHub secrets
- [ ] Adjust initial thresholds in `lighthouserc.yml` to match your app's current score
  *(Run Lighthouse in Chrome DevTools first to get a baseline)*
- [ ] Open a PR and verify the Lighthouse check appears and passes

---

## Phase 8 — Security Scanning `~10 min`

Both tools are already configured — you just need to confirm they run.

- [ ] **CodeQL**: No setup needed — `security.yml` triggers automatically on push to `main`
  Check **Security → Code scanning** after the first run for alerts.

- [ ] **OWASP ZAP**: Confirm `BASE_URL` secret is set (ZAP uses it as the scan target).
  Check **Actions → Security** after the first nightly run for the ZAP report artifact.

- [ ] *(Optional)* Add `.zap/rules.tsv` to suppress known false positives

---

## Phase 9 — Ongoing Maintenance

Once live, keep the pipeline healthy with these habits.

- [ ] **Smoke is a blocker** — a failing `@smoke` on `main` is treated like a production incident
- [ ] **Review Dependabot PRs weekly** — run smoke locally, merge if green
- [ ] **Update visual baselines intentionally** — use [commands/update-snapshots.md](commands/update-snapshots.md), never silence a diff without reviewing it
- [ ] **Audit smoke speed monthly** — if `@smoke` exceeds 2 minutes, move slow tests to `@regression`
- [ ] **Add smoke coverage for every new critical feature** — keep the definition of "working" up to date

---

## Done?

When all phases are complete, this pipeline provides:

| Check | Frequency |
| --- | --- |
| Smoke + API tests | Every push |
| Accessibility checks | Every PR |
| Visual diffs | Every PR (non-blocking) |
| Regression suite | Nightly + every push to `main` |
| Performance budgets | Every PR |
| Security scanning | Weekly + every push to `main` |
| Dependency updates | Weekly automated PRs |
| Slack alerts | Every CI run |

Remove or archive this file once the pipeline is fully live.
