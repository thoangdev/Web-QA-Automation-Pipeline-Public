# Development Setup Guide

This guide will help you set up the Dispel E2E Testing monorepo for local development.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** version control
- **VS Code** (recommended) with Playwright extension

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd playwright_sample

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your specific values
# Update base URLs, credentials, and integration settings
```

### 3. Verify Installation

```bash
# Run a quick test to verify setup
npm run test:stig -- --grep "should display login page"

# Check TypeScript compilation
npm run type-check

# Run linting
npm run lint
```

## Development Workflow

### Running Tests Locally

```bash
# Run all tests for a specific project
npm run test:stig
npm run test:abb
npm run test:dsmd

# Run in UI mode (interactive)
npm run test:ui

# Run specific test file
npx playwright test projects/stig/tests/login.spec.ts

# Run with debugging
npm run test:debug -- projects/stig/tests/login.spec.ts
```

### Code Generation

```bash
# Generate tests with Playwright codegen
npm run playwright:codegen:stig
npm run playwright:codegen:abb
npm run playwright:codegen:dsmd
```

### Project Structure

```
projects/
├── stig/
│   ├── constants.ts          # Project-specific constants
│   ├── pages/                # Page Object Models
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   ├── fixtures/             # Test fixtures and utilities
│   │   ├── auth.ts
│   │   ├── auth-setup.ts
│   │   └── cleanup.ts
│   └── tests/                # Test specifications
│       └── login.spec.ts
├── abb/                      # Same structure for ABB
├── dsmd/                     # Same structure for DSMD
```

## Best Practices

### Writing Tests

1. **Use Page Object Models**
   ```typescript
   // Good
   const loginPage = new LoginPage(page);
   await loginPage.login(username, password);
   
   // Avoid
   await page.locator('#username').fill(username);
   await page.locator('#password').fill(password);
   ```

2. **Use Project Constants**
   ```typescript
   // Good
   import { TEST_USERS, SELECTORS } from '../constants';
   await page.locator(SELECTORS.LOGIN_BUTTON).click();
   
   // Avoid
   await page.locator('[data-testid="login-button"]').click();
   ```

3. **Proper Test Organization**
   ```typescript
   test.describe('Feature Name', () => {
     test.beforeEach(async ({ page }) => {
       // Setup code
     });
     
     test('should do something specific', async () => {
       // Test implementation
     });
   });
   ```

### Adding New Tests

1. Create test file in appropriate project directory
2. Import required Page Objects and constants
3. Use descriptive test names
4. Include setup and cleanup
5. Add appropriate assertions

### Creating New Page Objects

1. Extend existing patterns
2. Use locators consistently
3. Include helper methods
4. Document complex interactions

## Debugging

### Local Debugging

```bash
# Run with browser visible
npm run test:headed

# Debug with Playwright Inspector
npm run test:debug

# Show trace viewer
npx playwright show-trace test-results/trace.zip
```

### VS Code Integration

1. Install Playwright extension
2. Configure launch.json for debugging
3. Use breakpoints in test files
4. Leverage IntelliSense for Playwright APIs

### Common Issues

1. **Browser not launching**
   - Run `npx playwright install`
   - Check system dependencies

2. **Timeout errors**
   - Increase timeout in test or config
   - Check element selectors
   - Verify page load performance

3. **Authentication failures**
   - Verify credentials in .env.local
   - Check auth fixture implementation
   - Ensure auth state files are generated

## Performance Tips

### Faster Test Execution

1. **Use authenticated states**
   ```typescript
   // Setup saves auth state
   test.use({ storageState: './auth.json' });
   ```

2. **Parallel execution**
   ```typescript
   // Enable in config
   fullyParallel: true,
   workers: process.env.CI ? 1 : undefined,
   ```

3. **Efficient waits**
   ```typescript
   // Good
   await page.waitForLoadState('networkidle');
   
   // Avoid
   await page.waitForTimeout(5000);
   ```

## Code Quality

### Linting and Formatting

```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Pre-commit Hooks

Consider setting up pre-commit hooks:

```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## Integration Testing

### ZAP Security Testing

1. Install OWASP ZAP locally
2. Configure ZAP proxy in .env.local
3. Enable ZAP in test configuration
4. Review security reports after tests

### API Testing

```typescript
// Test API endpoints alongside UI
test('should handle API responses', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
});
```

### Database Testing

```typescript
// Setup database state if needed
test.beforeEach(async () => {
  // Database setup code
});
```

## Contribution Guidelines

1. **Branch naming**: `feature/description` or `fix/description`
2. **Commit messages**: Use conventional commits format
3. **Pull requests**: Include test coverage and documentation
4. **Code review**: Ensure tests pass and follow patterns

## Getting Help

- **Playwright Documentation**: https://playwright.dev/
- **Project Issues**: Create GitHub issue with reproduction steps
- **Team Chat**: Use team Slack for quick questions
- **Code Review**: Tag appropriate team members for review

## Useful Commands Reference

```bash
# Testing
npm test                    # Run all tests
npm run test:ui            # Interactive mode
npm run test:headed        # Visible browser
npm run test:debug         # Debug mode

# Development
npm run lint               # Check code quality
npm run format             # Format code
npm run type-check         # TypeScript validation

# Reports
npm run report             # Open HTML report
npx playwright show-trace  # View test traces
```
