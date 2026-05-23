# Skill: Write Run Report

## Purpose

Write a per-run markdown file to `reports/runs/YYYY-MM-DD-<ticketId>.md` that records the full outcome of a `jira-qa-runner` session. Called at the end of every run, regardless of outcome.

---

## When to Use

- At the conclusion of every `jira-qa-runner` cycle (pass, fail, healed, or env-failure)
- When a human wants a written record of what happened in a specific run

---

## Input

| Field | Required | Description |
|-------|----------|-------------|
| `ticketId` | Yes | Jira ticket key, e.g. `PROJ-123` |
| `summary` | Yes | Ticket summary (from `pull-jira-ticket` output) |
| `testFiles` | Yes | List of generated test file paths |
| `runResult` | Yes | One of: `passed`, `failed`, `healed`, `env-failure` |
| `durationMs` | Yes | Total elapsed time of the run |
| `failureDetails` | No | Array of triage findings (from `analyze-failure` skill) |
| `selfHealLog` | No | What was changed in the self-heal attempt |
| `screenshotPaths` | No | Paths from `test-results/` — auto-captured by Playwright on failure |
| `defectKey` | No | Jira defect key if one was created or already existed |

---

## Output

A markdown file at `reports/runs/YYYY-MM-DD-<ticketId>.md`. The `reports/` directory is already gitignored and created by `global.setup.ts`. Create the `reports/runs/` subdirectory if it does not exist.

---

## Process

**Step 1 — Determine file path**

```
reports/runs/<YYYY-MM-DD>-<ticketId>.md
```

Use today's UTC date. Example: `reports/runs/2026-05-22-PROJ-123.md`.

**Step 2 — Write the report using this exact template**

```markdown
# QA Run Report — <ticketId>

**Date:** <YYYY-MM-DD HH:MM> UTC
**Ticket:** [<ticketId>](<JIRA_BASE_URL>/browse/<ticketId>) — <summary>
**Outcome:** `<runResult>`
**Duration:** <X.Xs>

---

## Test Files Generated

- `<path>`

---

## Execution Summary

| Metric  | Count |
|---------|-------|
| Passed  | N     |
| Failed  | N     |
| Flaky   | N     |
| Skipped | N     |

---

## Failures

<!-- Omit this section entirely if runResult is "passed" -->

### <test name>

**Category:** <Test bug | App bug | Flake | Environment>
**Root cause:** <one sentence from triage>
**Evidence:** `<exact error message>`
**Fix attempted:** <what self-heal changed, or "N/A — not attempted" or "N/A — out of scope">

**Screenshots:**
- `test-results/<path>/screenshot.png`

---

## Self-Heal Log

<!-- Omit this section if no self-heal was attempted -->

**Attempt 1/1**
**File modified:** `<path>`
**Change:** <one-sentence description of the fix>
**Result:** Resolved | Not resolved

---

## Jira Defect

<!-- Omit this section if no defect interaction occurred -->

**Key:** [<PROJ-456>](<JIRA_BASE_URL>/browse/<PROJ-456>)
**Status:** Created | Already existed (linked)

---

## Memory Stored

- <pattern 1>
- <pattern 2>
<!-- Omit if store-qa-memory found nothing worth persisting -->
```

**Step 3 — Write the file**

Use the Write tool to create the file at the computed path.

---

## Constraints

- Never embed credential values, tokens, or auth cookie contents
- Screenshot paths must be relative to the project root
- If `runResult` is `passed`: omit the Failures, Self-Heal Log, and Jira Defect sections entirely
- If `runResult` is `env-failure`: note that no tests ran, describe what the environment check returned
- File name uses ISO date format — `YYYY-MM-DD`, not locale-specific formats
- Always write the report — even partial data is better than no record
