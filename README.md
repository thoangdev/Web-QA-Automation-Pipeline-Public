# Dispel E2E Testing Monorepo

A comprehensive TypeScript Playwright testing framework for Dispel's multi-product ecosystem, featuring security testing with OWASP ZAP, test management integration with Tuskr, and automated Slack notifications.

## 🏗️ Project Structure

```
├── projects/
│   ├── stig/          # STIG Compliance Portal tests
│   ├── abb/           # ABB Analytics Platform tests
│   └── dsmd/          # DSMD Device Management tests
├── shared/            # Shared utilities and integrations
├── .github/workflows/ # CI/CD automation
└── playwright.config.ts # Root configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd playwright_sample

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Environment Setup

1. Copy the environment template:
```bash
cp .env .env.local
```

2. Configure your environment variables in `.env.local`:
```bash
# Base URLs
STIG_BASE_URL=https://stig.yourdomain.com
ABB_BASE_URL=https://abb.yourdomain.com
DSMD_BASE_URL=https://dsmd.yourdomain.com

# Authentication credentials
STIG_USERNAME=your-stig-username
STIG_PASSWORD=your-stig-password
# ... etc for each project

# Optional integrations
ZAP_ENABLED=true
SLACK_ENABLED=true
TUSKR_ENABLED=true
```

## 🧪 Running Tests

### Single Project
```bash
# Run tests for specific project
npm run test:stig
npm run test:abb
npm run test:dsmd
```

### All Projects
```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode (visible browser)
npm run test:headed
```

### Debug Mode
```bash
# Debug specific test
npm run test:debug -- projects/stig/tests/login.spec.ts
```

## 📊 Project Details

### STIG 
- **Purpose**: Compliance and security testing
- **Features**: User management, compliance scanning, security controls
- **Key Tests**: Authentication, authorization, compliance workflows

### ABB
- **Purpose**: Data analytics and reporting platform
- **Features**: Data visualization, report generation, analytics workflows
- **Key Tests**: Data processing, chart rendering, export functionality

### DSMD
- **Purpose**: IoT device monitoring and management
- **Features**: Device configuration, real-time monitoring, alert management
- **Key Tests**: Device connectivity, monitoring dashboards, configuration management

## 🔧 Configuration

### Playwright Configuration
Each project has isolated configuration with:
- Dedicated test directories
- Project-specific base URLs
- Independent authentication states
- Custom timeouts and retry logic

### Security Testing with ZAP
- OWASP ZAP proxy integration
- Automated security scanning
- HTML and JSON report generation
- CI/CD integration for security gates

### Test Management with Tuskr
- Automatic test result uploads
- Test case mapping via `tuskr-rules.json`
- Execution tracking and reporting
- Integration with test management workflows

### Slack Notifications
- Rich test result notifications
- Failed test details with links
- Integration with CI/CD pipelines
- Customizable messaging and channels

## 🤖 CI/CD Integration

### GitHub Actions Workflow
- **Triggers**: Daily schedule (7 AM CST), manual dispatch, PR checks
- **Matrix Strategy**: Parallel execution across all three projects
- **Security**: ZAP integration for security testing
- **Reporting**: Automatic report generation and artifact upload
- **Notifications**: Slack integration for team updates

### Manual Triggers
The workflow supports manual execution with options for:
- Project selection (individual or all)
- Environment selection (development, staging, production)
- ZAP security testing toggle
- Slack notification toggle

### Secrets Configuration
Required GitHub Secrets:
```
# Authentication
STIG_USERNAME, STIG_PASSWORD
ABB_USERNAME, ABB_PASSWORD  
DSMD_USERNAME, DSMD_PASSWORD

# Integrations
ZAP_API_KEY
SLACK_WEBHOOK_URL
TUSKR_API_URL, TUSKR_API_KEY
```

## 📋 Page Object Model

Each project implements the Page Object Model pattern:

```typescript
// Example: STIG Login Page
export class LoginPage {
  constructor(private page: Page) {}
  
  async login(username: string, password: string) {
    // Login implementation
  }
  
  async isLoginSuccessful(): Promise<boolean> {
    // Validation logic
  }
}
```

## 🔐 Authentication Management

### Authentication Fixtures
- Project-specific auth fixtures
- Role-based authentication (admin, user, auditor, etc.)
- Session state management
- API and UI authentication support

### Auth State Persistence
- Saved authentication states for faster test execution
- Automatic session refresh
- Cross-test authentication sharing

## 📈 Reporting and Analytics

### Built-in Reports
- HTML reports with screenshots and traces
- JSON reports for programmatic analysis
- ZAP security reports
- Test execution summaries

### Integration Reports
- Tuskr test management updates
- Slack notification summaries
- GitHub Pages deployment for report hosting

## 🛠️ Development Guidelines

### Adding New Tests
1. Create test files in the appropriate project directory
2. Use the project's Page Object Models
3. Follow the established naming conventions
4. Include appropriate test data and assertions

### Adding New Projects
1. Create project directory structure
2. Implement constants, pages, fixtures, and tests
3. Update Playwright configuration
4. Add to CI/CD workflow matrix

### Code Quality
- ESLint configuration for TypeScript
- Prettier formatting rules
- Type checking with TypeScript
- Automated code quality checks in CI

## 🔍 Debugging and Troubleshooting

### Common Issues
- **Authentication failures**: Check credentials in environment variables
- **ZAP proxy issues**: Verify ZAP installation and configuration
- **Test timeouts**: Adjust timeout values in project constants
- **CI failures**: Check GitHub Secrets configuration

### Debug Tools
- Playwright Inspector: `npm run test:debug`
- UI Mode: `npm run test:ui`
- Trace Viewer: Available in HTML reports
- Browser Dev Tools: Available in headed mode

## 📚 Additional Resources

### Playwright Documentation
- [Official Playwright Docs](https://playwright.dev/)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [API Testing Guide](https://playwright.dev/docs/api-testing)

### Security Testing
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [Security Testing Best Practices](https://owasp.org/www-project-web-security-testing-guide/)

### Integration Tools
- [Tuskr API Documentation](https://tuskr.app/docs/api)
- [Slack Webhook Setup](https://api.slack.com/messaging/webhooks)

## 🤝 Contributing

1. Create feature branch from `main`
2. Implement changes with appropriate tests
3. Run linting and formatting: `npm run lint:fix && npm run format`
4. Ensure all tests pass: `npm test`
5. Submit pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for comprehensive E2E testing across Dispel's product ecosystem**
