# Command: jira-qa-run

Run the full Jira-integrated QA cycle for a ticket: pull requirements, generate tests, wait for environment, execute, self-heal if needed, write a run report, and file a defect on persistent failure.

---

## Prerequisites

All required variables set in `.env.local`:

```bash
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=qa-bot@your-org.com
JIRA_API_TOKEN=<your-token>
JIRA_PROJECT_KEY=QA
BASE_URL=https://staging.example.com
TEST_USER_USERNAME=qa_user
TEST_USER_PASSWORD=<password>
```

Playwright browsers installed:

```bash
npx playwright install chromium
```

---

## Steps

**1. Verify required env vars are present**

```bash
grep -E "JIRA_BASE_URL|JIRA_EMAIL|JIRA_API_TOKEN|JIRA_PROJECT_KEY|BASE_URL" .env.local
```

**2. Check that the environment is reachable**

```bash
npx playwright test --project=setup --grep "environment" 2>/dev/null || \
  node -e "
    import('./src/utils/environmentCheck.js').then(m =>
      m.waitForEnvironment({ url: process.env.BASE_URL }).then(r => {
        console.log(r);
        if (!r.ready) process.exit(1);
      })
    );
  "
```

Or invoke the `check-environment` command for a standalone check.

**3. Invoke the jira-qa-runner agent**

Trigger via Claude Code:
```
Use agents/jira-qa-runner to run the QA cycle for PROJ-123
```

The agent handles ticket pull → test generation → execution → self-heal → report → defect.

**4. Review the run report**

```bash
cat reports/runs/$(date +%Y-%m-%d)-PROJ-123.md
```

**5. If failures persisted, open the HTML report**

```bash
npx playwright show-report
```

**6. If a defect was created, verify it in Jira**

The agent logs the defect key. Open `JIRA_BASE_URL/browse/<KEY>` to review.

---

## Expected Output

```
Run complete — PROJ-123
Outcome: passed | healed | failed
Duration: Xs
Tests: N passed / N failed
Report: reports/runs/2026-05-22-PROJ-123.md
Defect: QA-456 (created) | N/A
```

---

## When to Use

| Situation | Command |
|-----------|---------|
| Ticket is "Ready for Test" | This command |
| Quick sanity check only | `commands/smoke.md` |
| Environment is unstable | `commands/check-environment.md` first |
| Test was written manually | `commands/test.md` |

---

## Scope Variants

```bash
# Run against a specific tag in addition to the generated file
npx playwright test --grep "PROJ-123" --project=chromium

# Run with visible browser (debugging)
npx playwright test --grep "PROJ-123" --headed --project=chromium

# Reproduce a flake from this ticket
npx playwright test --grep "PROJ-123" --repeat-each 5 --project=chromium
```

---

## Constraints

- `BASE_URL` must not point to a production domain
- The agent does not commit any files — review generated tests before committing
- Self-heal is capped at one attempt — if it fails, a defect is filed and human review is required
- Run reports are gitignored (`reports/`) — archive them separately if needed for audit
