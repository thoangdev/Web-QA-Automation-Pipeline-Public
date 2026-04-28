# Command: lint

Run all static analysis checks. Run this before committing or opening a PR. CI runs the same checks and will fail on the same issues.

---

## Steps

**1. Type check**

```bash
npm run typecheck
```

Runs `tsc --noEmit`. Catches type errors across all `.ts` files without emitting output.

**2. Lint and format**

```bash
npm run lint
```

Runs ESLint + Prettier. Reports unused imports, `any` types, naming violations, and formatting issues.

**3. Fix auto-fixable issues**

```bash
npm run lint -- --fix
```

Applies safe, automatic fixes (import ordering, trailing commas, quote style). Always review the diff after running with `--fix`.

---

## Expected Output

No output from either command = all checks passed.

Errors print the file path, line number, and rule name:

```
src/pages/LoginPage.ts
  12:5  error  Unexpected use of 'any'  @typescript-eslint/no-explicit-any
```

---

## Common Issues and Fixes

| Error | Fix |
| --- | --- |
| `Unexpected 'any' type` | Replace with a specific type or `unknown` |
| `'X' is defined but never used` | Remove unused variable or import |
| `Missing return type on function` | Add explicit return type annotation |
| `Replace '...' with '...'` (Prettier) | Run `npm run lint -- --fix` |
| `Property 'X' does not exist on type 'Y'` | Fix the type mismatch or assertion |

---

## When to Use

- Before every commit
- Before opening a PR
- After a refactor touches many files — catch broken types early
- CI runs this on every push — fixing locally is faster than waiting for CI to fail
