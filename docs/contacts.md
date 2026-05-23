# Team Contacts & Project Reference

Reference for the `jira-qa-runner` agent and QA team — escalation paths, Jira project keys, environment owners, and token management.

---

## Jira Project Keys

| Project area | Key | Used for |
|--------------|-----|----------|
| Main product | PROJ | Feature tickets — source of test input for `jira-qa-runner` |
| QA defects | QA | Auto-created `[AUTO]` defects from `create-jira-defect` skill |

> Update these keys when your team's Jira projects are established.

---

## Environment Owners

| Environment | URL | Owner | Contact |
|-------------|-----|-------|---------|
| Staging | `https://staging.example.com` | Platform team | `#platform-ops` Slack |
| QA | `https://qa.example.com` | QA team | `qa@your-org.com` |

> Fill in real URLs and contacts before adopting this template.

---

## Escalation Path

Follow this path when `jira-qa-runner` encounters an issue it cannot resolve automatically:

1. **Selector drift / Test bug** — Self-heal attempts the fix automatically. If it fails, a Jira defect is created. No escalation needed.

2. **App bug** — A `[AUTO]` Jira defect is created with `priority: High` and linked to the source ticket. Assign to the dev team oncall: `#dev-oncall` Slack.

3. **Environment not ready** — `waitForEnvironment` timed out. Ping `#platform-alerts` Slack. Contact: `<platform-ops-name>`.

4. **Jira API failure** — Check that `JIRA_API_TOKEN` has not expired (see token rotation below). Contact the Jira admin: `<jira-admin-name>`.

5. **Recurring self-heal failures (3+ runs)** — The AC-to-test generation step likely needs tighter prompting. Create a tech-debt ticket in `PROJ`. Assign to QA lead: `<qa-lead-name>`.

---

## QA Bot Service Account

The service account used by `JiraApi.ts` and the Jira MCP server:

| Field | Value |
|-------|-------|
| Email | `qa-bot@your-org.com` |
| Jira role | Project Member (read tickets, create bugs) |
| Token rotation | Every 90 days |
| Token location | GitHub Secrets (`JIRA_API_TOKEN`) + `.env.local` |
| Token owner | `<name>` |

### Token Rotation Checklist

Run this when the token is about to expire:

1. Generate a new token at `https://id.atlassian.com/manage-profile/security/api-tokens`
2. Update `JIRA_API_TOKEN` in GitHub repository secrets (Settings → Secrets → Actions)
3. Update `.env.local` on all developer machines that run the Jira workflow locally
4. Verify connectivity: run `commands/check-environment.md` and confirm the Jira MCP server responds

---

## Weekly Auto-Defect Review

Auto-created defects (`[AUTO]` prefix, label `automated-qa`) need weekly human triage to close false positives and link related issues.

**JQL to review the week's auto-defects:**

```
project=QA AND labels="automated-qa" AND created>=-7d ORDER BY created DESC
```

Open in Jira and review each:
- False positive → close as `Won't Fix`
- Real bug → remove `[AUTO]` prefix, assign to dev
- Duplicate → link to parent and close
- Recurring pattern → create a tech-debt ticket in `PROJ`

---

## Key URLs

| Resource | URL |
|----------|-----|
| Jira | `https://your-org.atlassian.net` |
| Staging | `https://staging.example.com` |
| CI (GitHub Actions) | `https://github.com/your-org/your-repo/actions` |
| Playwright report (local) | `npx playwright show-report` |
| Jira API token mgmt | `https://id.atlassian.com/manage-profile/security/api-tokens` |
