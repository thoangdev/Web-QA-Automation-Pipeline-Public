# GitHub Secrets Configuration Guide

This document outlines the GitHub Secrets that need to be configured for the Dispel E2E Testing monorepo to function properly in CI/CD environments.

## Required Secrets

### Authentication Secrets

#### STIG Project
- `STIG_USERNAME` - Username for STIG application admin user
- `STIG_PASSWORD` - Password for STIG application admin user
- `STIG_ADMIN_USERNAME` - Additional admin username if different from main user
- `STIG_ADMIN_PASSWORD` - Additional admin password if different from main user

#### ABB Project  
- `ABB_USERNAME` - Username for ABB application analyst user
- `ABB_PASSWORD` - Password for ABB application analyst user
- `ABB_ANALYST_USERNAME` - Additional analyst username if different from main user
- `ABB_ANALYST_PASSWORD` - Additional analyst password if different from main user

#### DSMD Project
- `DSMD_USERNAME` - Username for DSMD application admin user
- `DSMD_PASSWORD` - Password for DSMD application admin user
- `DSMD_ADMIN_USERNAME` - Additional admin username if different from main user
- `DSMD_ADMIN_PASSWORD` - Additional admin password if different from main user

### Integration Secrets

#### OWASP ZAP Security Testing
- `ZAP_API_KEY` - API key for ZAP proxy authentication (generate with ZAP)

#### Slack Notifications
- `SLACK_WEBHOOK_URL` - Slack webhook URL for sending notifications
  - Format: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`
  - Create at: https://api.slack.com/messaging/webhooks

#### Tuskr Test Management
- `TUSKR_API_URL` - Tuskr API base URL (e.g., `https://api.tuskr.com`)
- `TUSKR_API_KEY` - Tuskr API authentication key
- `TUSKR_PROJECT_ID` - Tuskr project identifier for test case mapping

## How to Configure Secrets

### In GitHub Repository

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

### Example Secret Configuration

```
Name: STIG_USERNAME
Value: stig.admin@yourdomain.com

Name: STIG_PASSWORD  
Value: YourSecurePassword123!

Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/T1234567/B7654321/abcdefghijklmnopqrstuvwx
```

## Environment-Specific Configuration

You can create different secrets for different environments by using prefixes:

### Development Environment
- `DEV_STIG_USERNAME`
- `DEV_STIG_PASSWORD`
- etc.

### Staging Environment  
- `STAGING_STIG_USERNAME`
- `STAGING_STIG_PASSWORD`
- etc.

### Production Environment
- `PROD_STIG_USERNAME`
- `PROD_STIG_PASSWORD`
- etc.

## Security Best Practices

1. **Rotate Secrets Regularly** - Update passwords and API keys periodically
2. **Use Service Accounts** - Create dedicated test accounts rather than personal accounts
3. **Limit Permissions** - Give test accounts only the minimum required permissions
4. **Monitor Usage** - Track secret usage and audit access logs
5. **Separate Environments** - Use different credentials for dev/staging/production

## Verification

After configuring secrets, you can verify they're working by:

1. Triggering a manual workflow run
2. Checking the workflow logs for authentication success
3. Reviewing test results for proper execution
4. Confirming integrations (Slack notifications, Tuskr uploads, ZAP reports)

## Troubleshooting

### Common Issues

1. **Secret Not Found Error**
   - Verify secret name matches exactly (case-sensitive)
   - Check secret is configured at repository level, not organization level

2. **Authentication Failures**
   - Verify credentials are correct and current
   - Check if accounts are locked or disabled
   - Ensure service accounts have proper permissions

3. **Integration Failures**
   - Verify API endpoints are correct and accessible
   - Check API key permissions and expiration
   - Confirm webhook URLs are active

### Debug Steps

1. Check GitHub Actions workflow logs
2. Verify secret values (without exposing them)
3. Test credentials manually outside of CI
4. Check integration service status and documentation

## Contact

For questions about secret configuration or access issues, contact the DevOps team or repository administrators.
