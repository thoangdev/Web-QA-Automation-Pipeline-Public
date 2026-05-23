# Skill: Create Jira Defect

## Purpose

Create a Jira bug ticket when tests fail persistently after a self-heal attempt or when the failure category is `App bug`. Includes a deduplication check to avoid spamming the backlog.

---

## When to Use

- Called by `jira-qa-runner` when `runResult` is `failed` after self-heal, or when `analyze-failure` returns category `App bug`
- Never called when `runResult` is `env-failure` — environment issues go to the platform team, not Jira
- Never called when `runResult` is `passed` or `healed`

---

## Input

| Field | Required | Description |
|-------|----------|-------------|
| `testName` | Yes | Exact failing test title (used for dedup search) |
| `triageFinding` | Yes | Full 4-part triage output (Category, Root cause, Evidence, Fix) |
| `projectKey` | Yes | Jira project key from `JIRA_PROJECT_KEY` env var |
| `sourceTicketId` | Yes | Original ticket that triggered this `jira-qa-runner` run |
| `runReportPath` | Yes | Path to the run report file just written |
| `screenshotPaths` | No | Paths to failure screenshots in `test-results/` |
| `selfHealAttempted` | No | Whether a self-heal was tried (boolean) |

---

## Process

**Step 1 — Deduplication check**

Before creating anything, search for existing open defects:

Via Jira MCP: use `search_issues` with JQL:
```
project="<projectKey>" AND issuetype=Bug AND status NOT IN (Done,Resolved) AND summary~"<testName>" ORDER BY created DESC
```

Via `JiraApi.searchOpenDefects(testName, projectKey)` as fallback.

If results found → log and return:
```
defect: skipped — open defect <KEY> already exists for test "<testName>"
```
Return the existing key — do not create a duplicate.

**Step 2 — Determine priority**

| Triage category | Priority |
|-----------------|----------|
| App bug | High |
| Test bug (self-heal failed) | Medium |
| Flake (self-heal failed) | Low |

**Step 3 — Build the defect description**

```
*Triggered by:* <sourceTicketId>
*Test file:* <test file path>
*Test name:* <testName>

*Category:* <triage Category>
*Root cause:* <triage Root cause>
*Evidence:* <triage Evidence>

*Self-heal attempted:* <Yes — 1/1 attempts, fix did not resolve | No>
*Screenshots:* <paths from test-results/ or "none captured">
*Run report:* <runReportPath>
```

**Step 4 — Create the defect**

Via Jira MCP: use `create_issue` with:
- `summary`: `[AUTO] <testName> — <triage Category>`
- `issuetype`: `Bug`
- `description`: built in Step 3
- `labels`: `["automated-qa", "self-heal-failed"]`
- `priority`: determined in Step 2

Via `JiraApi.createDefect(payload)` as fallback.

**Step 5 — Link to source ticket**

Via Jira MCP: use `create_issue_link` with `type: "relates to"` linking the new defect to `sourceTicketId`.

Via `JiraApi.addComment(sourceTicketId, ...)` as fallback: post a comment on the source ticket referencing the new defect key.

**Step 6 — Return result**

```
defect: created — <NEW-KEY>
status: new
linked to: <sourceTicketId>
```

---

## Constraints

- Always run the deduplication check — never skip it
- Never create defects for `Environment` category failures
- Never embed `JIRA_API_TOKEN` values in output or description
- Summary must start with `[AUTO]` so humans can filter and triage these separately
- Maximum one defect per `jira-qa-runner` run
- If defect creation fails (API error), log the error and continue — do not abort the run report
