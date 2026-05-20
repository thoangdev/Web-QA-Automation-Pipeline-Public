## Summary

<!-- One or two sentences. What changed and why. -->

## Type of change

- [ ] New test(s) — feature coverage
- [ ] Test fix — flake, false positive, or broken selector
- [ ] Page Object change
- [ ] Fixture / setup / teardown change
- [ ] CI / workflow change
- [ ] Dependency update
- [ ] Documentation only

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:smoke` passes against my target
- [ ] New tests are tagged (`@smoke`, `@regression`, `@api`, `@a11y`, `@visual`)
- [ ] No `waitForTimeout`, no CSS class selectors, no XPath
- [ ] No credentials, tokens, or secrets in code
- [ ] Visual baseline changes were reviewed image-by-image (if applicable)
- [ ] Updated `CLAUDE.md` / `README.md` / `GETTING_STARTED.md` if behaviour changed

## Test evidence

<!-- Paste the relevant section of the Playwright report, or link to the CI run. -->

## Notes for reviewers

<!-- Anything non-obvious — areas of risk, alternatives considered, follow-up tasks. -->
