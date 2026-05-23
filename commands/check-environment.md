# Command: check-environment

Poll `BASE_URL` with exponential backoff until it returns HTTP 200 or the timeout expires. Use this before kicking off any test run when environment stability is uncertain.

---

## Prerequisites

- `BASE_URL` is set in `.env.local`

---

## Steps

**1. Run the environment check**

```bash
PW_CHROMIUM_CHANNEL=chrome npx ts-node --esm -e "
import { waitForEnvironment } from './src/utils/environmentCheck.js';
waitForEnvironment({ url: process.env.BASE_URL! }).then(r => {
  console.log(JSON.stringify(r, null, 2));
  if (!r.ready) process.exit(1);
});
"
```

Or via Node directly if TypeScript is compiled:

```bash
node -e "
const { waitForEnvironment } = require('./dist/utils/environmentCheck');
waitForEnvironment({ url: process.env.BASE_URL }).then(r => {
  console.log(r);
  process.exit(r.ready ? 0 : 1);
});
"
```

---

## Expected Output

Environment ready:

```json
{
  "ready": true,
  "attempts": 1,
  "totalElapsedMs": 412,
  "lastStatus": 200
}
```

Environment not ready after timeout:

```json
{
  "ready": false,
  "attempts": 12,
  "totalElapsedMs": 300004,
  "lastStatus": 503,
  "lastError": "HTTP 503"
}
```

Exit code `0` on ready, `1` on timeout.

---

## Options

| Env var | Default | Effect |
|---------|---------|--------|
| `ENV_CHECK_TIMEOUT_MS` | `300000` (5 min) | Override poll timeout |
| `BASE_URL` | required | Target URL to poll |

Example with shorter timeout:

```bash
ENV_CHECK_TIMEOUT_MS=30000 npx ts-node -e "..."
```

---

## Common Issues and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error: fetch is not a function` | Node < 18 | Use Node 18+ |
| Immediate `ready: false` with `attempts: 1` | `BASE_URL` DNS not resolving | Check `BASE_URL` value in `.env.local` |
| Hangs past timeout | Environment genuinely down | Contact platform team via `docs/contacts.md` |
| `lastError: "AbortError"` | Per-request 10s timeout hit | Environment is very slow — increase `ENV_CHECK_TIMEOUT_MS` |

---

## When to Use

- Before running `commands/jira-qa-run.md` in an unstable environment
- In CI to gate test execution on environment readiness
- When `BASE_URL` was recently deployed and needs a health check before tests start
