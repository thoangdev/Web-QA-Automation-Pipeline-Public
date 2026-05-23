# Skill: Pull Jira Ticket

## Purpose

Extract the title, description, and acceptance criteria from a Jira ticket so they can be used to generate test cases.

---

## When to Use

- First step of the `jira-qa-runner` agent before test generation
- When a human asks "what does ticket PROJ-123 require?"
- When you need to map acceptance criteria to test scenarios before writing any code

---

## Input

| Field | Required | Description |
|-------|----------|-------------|
| `ticketId` | Yes | Jira issue key, e.g. `PROJ-123` |
| `jiraBaseUrl` | Yes | From `JIRA_BASE_URL` env var — no trailing slash |

---

## Output

A structured ticket extract:

```
Ticket: PROJ-123
Summary: <ticket title>
Description: <full plain-text description>
Acceptance Criteria:
  1. <criterion>
  2. <criterion>
  ...
AC source: explicit section | full description (no AC section found)
```

---

## Process

**Step 1 — Fetch the ticket**

Use the Jira MCP server (configured in `.mcp.json`):
- Tool: `get_issue` with `issueId: ticketId`

If the MCP server is unavailable, fall back to `JiraApi.getTicket(ticketId)` from `src/api/JiraApi.ts`.

**Step 2 — Extract summary**

Read `fields.summary`. This becomes the hint for naming the generated test file (snake_case it, e.g. `"User can filter products"` → `product_filter`).

**Step 3 — Extract description**

Read `fields.description`. Jira Cloud returns Atlassian Document Format (ADF) — extract plain text from `content[].content[].text` recursively, or use the MCP tool's rendered output directly.

**Step 4 — Find acceptance criteria**

Scan the description for a section heading that matches any of:
- `## Acceptance Criteria`
- `## AC`
- `## Criteria`
- `**Acceptance Criteria**`

If found: extract only the content under that heading as a numbered list. Each bullet or numbered item becomes one criterion.

If not found: use the entire description text as the requirements and flag it:
```
AC source: full description (no AC section found)
```

**Step 5 — Validate and output**

Log the structured extract. If the ticket is not found, error clearly:
```
Error: Ticket PROJ-123 not found. Check JIRA_BASE_URL and JIRA_API_TOKEN credentials.
```

---

## Constraints

- Never expose `JIRA_API_TOKEN` in any output or log
- If description is null or empty, flag it: `"Ticket has no description — AC must be provided manually before test generation"`
- One ticket at a time — do not bulk-fetch
- Do not modify the ticket or add comments during this step
