# Command: new-page

Scaffold a new page object and matching test files for a new page or feature area. Follow these steps in order — each step depends on the previous one.

---

## Before You Start

Answer these questions:

1. What is the page URL? (e.g. `/projects/new`)
2. What user actions need to be automated? (e.g. fill form, click submit, see result)
3. Does the page require a logged-in user?
4. What test types are needed? (smoke / regression / api / a11y / visual)

---

## Steps

**1. Check for an existing page object**

```bash
ls src/pages/
```

If a class already covers this page, skip to step 3.

**2. Create the page object**

Use `skills/create-page-object.md`.

File: `src/pages/<Name>Page.ts`

Requirements:
- Extends `BasePage`
- All locators are `private readonly`
- Methods are named for user actions
- Includes `waitForLoad()`
- No `expect()` calls

**3. Create a smoke test**

Use `skills/write-test.md`.

File: `tests/smoke/<page-name>.smoke.spec.ts`

Requirements:
- Tag: `@smoke`
- Covers the single most critical happy path
- Completes in under 30 seconds
- Uses the page object from step 2

**4. (Optional) Create a regression test**

File: `tests/regression/<page-name>.regression.spec.ts`

Requirements:
- Tag: `@regression`
- Covers happy path + key error states + edge cases

**5. Run the new smoke test**

```bash
npx playwright test tests/smoke/<page-name>.smoke.spec.ts --project=chromium
```

Fix any failures before continuing.

**6. Type check**

```bash
npm run typecheck
```

No errors before committing.

---

## Output

```
src/pages/<Name>Page.ts
tests/smoke/<page-name>.smoke.spec.ts
tests/regression/<page-name>.regression.spec.ts   ← optional
```

---

## Naming Rules

| What | Convention | Example |
| --- | --- | --- |
| Page object class | PascalCase + `Page` suffix | `ProjectsPage` |
| Page object file | PascalCase + `Page.ts` | `ProjectsPage.ts` |
| Smoke test file | kebab-case + `.smoke.spec.ts` | `projects.smoke.spec.ts` |
| Regression test file | kebab-case + `.regression.spec.ts` | `projects.regression.spec.ts` |

---

## Example

For a new `/projects` page:

```bash
# Creates:
src/pages/ProjectsPage.ts
tests/smoke/projects.smoke.spec.ts
tests/regression/projects.regression.spec.ts

# Then verify:
npx playwright test tests/smoke/projects.smoke.spec.ts --project=chromium
npm run typecheck
```
