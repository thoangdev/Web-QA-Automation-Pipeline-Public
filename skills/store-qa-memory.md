# Skill: Store QA Memory

## Purpose

Persist reusable learnings from a completed QA run to Claude memory so future runs benefit from accumulated knowledge about selectors, flake patterns, defect history, and environment behavior.

---

## When to Use

- At the end of every `jira-qa-runner` run that produced something worth remembering
- When a human explicitly asks to save a QA pattern or finding
- Skip if `runResult` is `env-failure` — environment transience is not worth memorizing

---

## Input

| Field | Required | Description |
|-------|----------|-------------|
| `ticketId` | Yes | Source ticket that triggered this run |
| `runResult` | Yes | `passed`, `failed`, `healed` |
| `testFiles` | Yes | Generated test file paths |
| `selfHealLog` | No | What selector/timing fix was applied and whether it worked |
| `triageFinding` | No | Full triage output if failure occurred |
| `defectKey` | No | Created or linked Jira defect key |

---

## What to Store

Only store findings that are reusable across future tickets and runs. Do not store one-off run data — that belongs in the run report.

| Memory type | Store when | Example |
|-------------|-----------|---------|
| Selector pattern | Self-heal succeeded with a selector fix | `Login button: use getByRole('button', {name: 'Login'}) — getByTestId('login-btn') stale after refactor` |
| Flake pattern | Flake identified and fixed | `Cart badge count: add waitForResponse('**/cart') before asserting count` |
| Defect history | Defect created or linked | `PROJ-456 opened for login flow failure — triggered by PROJ-123 on 2026-05-22` |
| AC extraction pattern | Ticket had useful structural pattern | `PROJ-123 AC format: numbered list under "## Acceptance Criteria" heading` |
| Environment timing | Environment check revealed useful timing | `saucedemo.com becomes ready within 2s — ENV_CHECK_TIMEOUT_MS=30000 is sufficient` |
| Self-heal miss | Out-of-scope self-heal reveals systemic issue | `Checkout flow logic failures appear as Test bug — always re-triage before attempting self-heal` |

---

## Process

**Step 1 — Review inputs for memorable patterns**

Ask: "Would this help the next run of a similar ticket?" If yes, store it. If it is specific to this one run only, skip it.

**Step 2 — Format each memory entry**

One sentence per entry, prefixed with ticket ID and date:
```
[PROJ-123 | 2026-05-22] <memory content>
```

**Step 3 — Save to Claude memory**

Write each entry as a `project` or `feedback` type memory in the project memory directory:
- Selector/flake patterns → `feedback` type (reusable behavioral guidance)
- Defect history → `project` type (time-bounded fact)
- Environment timing → `project` type

**Step 4 — Reference in run report**

List the memory entries stored in the `## Memory Stored` section of the run report.

---

## What NOT to Store

- Raw test output or terminal logs — those belong in the run report
- Full triage finding detail — one-sentence summary only
- Auth token values, cookies, or session data — never
- Screenshots or file paths — they change between runs
- Run metrics (pass/fail counts, durations) — audit trail only, not learnable

---

## Constraints

- No credentials or token values in any memory entry
- Tag every entry with `[ticketId | date]` for traceability
- Memory entries are concise — one sentence each
- If nothing is worth storing, say so: `"No reusable patterns found this run"`
