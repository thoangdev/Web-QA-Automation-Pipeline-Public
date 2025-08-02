/**
 * STIG Project Constants
 * 
 * Static data and configuration for STIG application testing
 */

// Application URLs and endpoints
export const URLS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/admin/users',
  COMPLIANCE: '/compliance',
  REPORTS: '/reports',
  SETTINGS: '/settings'
} as const;

// Test user credentials (use environment variables in CI)
export const TEST_USERS = {
  ADMIN: {
    username: process.env.STIG_ADMIN_USERNAME || 'stig.admin@dispel.com',
    password: process.env.STIG_ADMIN_PASSWORD || 'SecurePass123!',
    role: 'administrator'
  },
  STANDARD: {
    username: process.env.STIG_USER_USERNAME || 'stig.user@dispel.com', 
    password: process.env.STIG_USER_PASSWORD || 'UserPass123!',
    role: 'standard_user'
  },
  AUDITOR: {
    username: process.env.STIG_AUDITOR_USERNAME || 'stig.auditor@dispel.com',
    password: process.env.STIG_AUDITOR_PASSWORD || 'AuditPass123!',
    role: 'auditor'
  }
} as const;

// UI selectors and data
export const SELECTORS = {
  // Login page
  LOGIN_FORM: '[data-testid="login-form"]',
  USERNAME_INPUT: '[data-testid="username-input"]',
  PASSWORD_INPUT: '[data-testid="password-input"]',
  LOGIN_BUTTON: '[data-testid="login-button"]',
  LOGIN_ERROR: '[data-testid="login-error"]',
  
  // Navigation
  NAV_MENU: '[data-testid="nav-menu"]',
  USER_DROPDOWN: '[data-testid="user-dropdown"]',
  LOGOUT_BUTTON: '[data-testid="logout-button"]',
  
  // Dashboard
  DASHBOARD_HEADER: '[data-testid="dashboard-header"]',
  COMPLIANCE_SUMMARY: '[data-testid="compliance-summary"]',
  RECENT_SCANS: '[data-testid="recent-scans"]',
  ALERTS_PANEL: '[data-testid="alerts-panel"]',
  
  // User Management
  USER_TABLE: '[data-testid="user-table"]',
  ADD_USER_BUTTON: '[data-testid="add-user-button"]',
  USER_MODAL: '[data-testid="user-modal"]',
  DELETE_USER_BUTTON: '[data-testid="delete-user-button"]',
  
  // Compliance
  COMPLIANCE_STATUS: '[data-testid="compliance-status"]',
  SCAN_BUTTON: '[data-testid="scan-button"]',
  SCAN_RESULTS: '[data-testid="scan-results"]'
} as const;

// Test data for forms
export const TEST_DATA = {
  NEW_USER: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@dispel.com',
    role: 'standard_user'
  },
  
  COMPLIANCE_SCAN: {
    name: 'Automated Test Scan',
    type: 'full_system',
    targets: ['workstation', 'server']
  }
} as const;

// Expected text content
export const EXPECTED_TEXT = {
  LOGIN_PAGE_TITLE: 'STIG Compliance Portal',
  DASHBOARD_TITLE: 'Security Dashboard',
  SUCCESSFUL_LOGIN: 'Welcome back',
  INVALID_CREDENTIALS: 'Invalid username or password',
  ACCESS_DENIED: 'Access denied',
  USER_CREATED: 'User created successfully',
  SCAN_COMPLETED: 'Compliance scan completed'
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  LOGIN: 10000,
  NAVIGATION: 5000,
  FORM_SUBMISSION: 15000,
  SCAN_COMPLETION: 60000,
  API_RESPONSE: 30000
} as const;

// API endpoints for backend testing
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  USERS: '/api/users',
  COMPLIANCE: '/api/compliance',
  SCANS: '/api/scans',
  REPORTS: '/api/reports'
} as const;
