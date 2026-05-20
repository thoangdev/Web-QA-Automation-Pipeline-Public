# Security Policy

This template ships QA tooling, not a production service. The threat surface is mainly:
the credentials it reads, the CI it runs in, and the URLs it scans.

## Reporting a vulnerability

Open a private security advisory in GitHub — **Security → Advisories → Report a vulnerability**.
Do not file a public issue. We aim to acknowledge within 3 business days.

## Secrets — handling rules

- **Never commit** `.env.local`, `.auth/*`, ZAP scan output, or any file containing tokens,
  passwords, webhook URLs, or session state. These are all in `.gitignore`.
- Read credentials only from `process.env.*` — never inline them in source.
- CI reads credentials from GitHub Actions secrets:
  `BASE_URL`, `TEST_USER_USERNAME`, `TEST_USER_PASSWORD`, `SLACK_WEBHOOK_URL`,
  `LHCI_GITHUB_APP_TOKEN`.
- Test traces and screenshots can leak data. The template strips auth cookies from saved
  storage state on teardown (`src/fixtures/global.teardown.ts`) when running in CI.

## Targets — never point at production

- `BASE_URL` must be a staging or test environment. Tests create data, modify state, and
  may exercise destructive flows.
- OWASP ZAP runs a **passive** scan only (`-I`). It does not send attack payloads, but it
  does crawl the site — keep it pointed at non-production.

## Dependencies

- Dependabot keeps Playwright, axe-core, and pinned action SHAs current — review weekly.
- `npm audit --omit=dev --audit-level=high` runs in CI and blocks merges on high/critical
  production-dependency vulnerabilities.
- GitHub's `dependency-review-action` blocks PRs that introduce new high-severity
  transitive dependencies.

## CI hardening

- Workflows declare least-privilege `permissions:` blocks.
- Pull requests cancel in-progress runs (`concurrency.cancel-in-progress: true`) to limit
  resource use, while pushes to `main` and scheduled runs do not.
- Gitleaks scans every push and PR for committed secrets.
- CodeQL runs on every push to `main` and on PRs.

## Out of scope

- Vulnerabilities in saucedemo.com itself — report those to Sauce Labs.
- Issues in `@playwright/test`, `@axe-core/playwright`, or other upstream deps — report
  upstream.
