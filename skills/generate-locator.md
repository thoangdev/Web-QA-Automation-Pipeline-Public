# Skill: Generate Locator

## Purpose

Identify the best Playwright locator for a UI element — the most stable, semantic option available.

---

## When to Use

- Writing a new page object and need a locator for a button, field, or element
- An existing locator has broken (selector stale, class renamed, XPath brittle)
- Cleaning up `codegen` output into project-standard selectors
- Reviewing locators in an existing page object for fragility

---

## Input

One or more of:
- Element description in plain language (e.g., "the submit button in the checkout form")
- HTML snippet of the element
- A broken or fragile selector that needs replacing
- A URL to inspect live with `npx playwright codegen`

---

## Output

The recommended Playwright locator expression with a brief explanation of why it was chosen, and a fallback if the first choice is not possible.

---

## Selector Priority

Work down this list — stop at the first option that uniquely identifies the element:

| Priority | Locator | Use when |
| --- | --- | --- |
| 1 | `page.getByRole('button', { name: 'Sign in' })` | Element has a role and accessible name |
| 2 | `page.getByLabel('Email address')` | Form field with an associated `<label>` |
| 3 | `page.getByPlaceholder('Search...')` | Input with a `placeholder` attribute |
| 4 | `page.getByText('Confirm order')` | Element with unique visible text |
| 5 | `page.getByTestId('submit-btn')` | `data-testid` attribute is present |
| Avoid | `page.locator('.btn-primary')` | CSS class — fragile, changes with refactors |
| Never | `page.locator('//div[2]/button')` | XPath — breaks on structural changes |

---

## Process

1. Does the element have a semantic role (button, link, heading, checkbox) and visible text or label?
   → `getByRole`

2. Is it a form input with a visible `<label>` element?
   → `getByLabel`

3. Does it have a `placeholder` attribute?
   → `getByPlaceholder`

4. Does it have unique visible text that won't change with internationalisation?
   → `getByText`

5. Does it have a `data-testid` attribute?
   → `getByTestId`

6. None of the above?
   → Recommend adding `data-testid` to the frontend. Do not use a CSS class or XPath.

---

## Scoping to a Container

If the same locator matches multiple elements, scope it to a container first:

```typescript
// Too broad
page.getByRole('button', { name: 'Delete' })

// Scoped to a specific row
page.getByRole('row', { name: 'Project Alpha' }).getByRole('button', { name: 'Delete' })
```

---

## Constraints

- Never output a CSS class selector
- Never output an XPath expression
- Never output a positional selector (`nth()`) without scoping it to a `data-testid` container
- If no stable locator exists, say so clearly and recommend adding `data-testid` to the frontend element

---

## Output Format

```typescript
// Recommended
page.getByRole('button', { name: 'Sign in' })
// Reason: button has role="button" and visible text "Sign in"

// If data-testid needed
page.getByTestId('login-submit')
// Add to frontend: <button data-testid="login-submit">Sign in</button>
```
