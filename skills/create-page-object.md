# Skill: Create Page Object

## Purpose

Scaffold a new Page Object Model class in `src/pages/` or a reusable component object in `src/components/`.

---

## When to Use

- A test needs to interact with a page that has no existing POM class
- A page has grown too large and a section needs to be extracted into a component
- A modal, drawer, or repeated UI pattern is used across multiple pages

---

## Input

| Field                   | Required  | Description                      |
| ----------------------- | --------- | -------------------------------- |
| Page or component name  | Yes       | Becomes the class and file name  |
| Target URL              | For pages | Where this page lives in the app |
| Interactions needed     | Yes       | List of user actions to automate |
| HTML or screenshot      | No        | Used to derive precise locators  |
| Full page or component? | Yes       | Determines folder and base class |

---

## Output

A new `.ts` file containing:

- A class extending `BasePage` (full page) or using `Page` directly (component)
- Private locator fields for every interactive element
- Public action methods named for user intent
- A `waitForLoad()` method
- No assertions

---

## Process

1. **Check for duplicates** — search `src/pages/` before creating anything
2. **Determine type:**
   - Full page → `src/pages/<Name>Page.ts`, extends `BasePage`
   - Reusable component → `src/components/<Name>.ts`, receives `page: Page` in constructor
3. **Define locators** — apply selector priority for each element:
   ```
   getByRole()        → first choice
   getByLabel()       → form fields
   getByPlaceholder() → input fallback
   getByText()        → visible text
   getByTestId()      → when no semantic selector exists
   ```
4. **Name methods for user actions:**
   - `login()` not `clickLoginButton()`
   - `createProject(name)` not `fillProjectNameAndSubmit()`
   - `search(query)` not `typeQueryAndPressEnter()`
5. **Add `waitForLoad()`** — assert a reliable indicator of page readiness (a heading, URL pattern, or key element)
6. Verify the quality checklist before outputting

---

## Constraints

- No `expect()` inside page objects — assertions belong in tests
- No public locator fields — always `private readonly`
- No `waitForTimeout` — use explicit waits in methods if needed
- Import `Page`, `Locator` types only from `@playwright/test` — do not import the `test` runner
- Named export only — no default exports

---

## Template — Full Page

```typescript
// src/pages/<Name>Page.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class <Name>Page extends BasePage {
  private readonly <field>  = this.page.getByLabel('<Label>');
  private readonly <button> = this.page.getByRole('button', { name: '<Name>' });

  async waitForLoad() {
    await this.page.waitForURL('**/<path>');
  }

  async <action>(<param>: string) {
    await this.goto('/<path>');
    await this.<field>.fill(<param>);
    await this.<button>.click();
  }
}
```

## Template — Reusable Component

```typescript
// src/components/<Name>.ts
import { Page, Locator } from '@playwright/test';

export class <Name> {
  private readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('<role>', { name: '<name>' });
  }

  async <action>() {
    await this.root.getByRole('menuitem', { name: '<item>' }).click();
  }
}
```
