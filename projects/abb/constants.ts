/**
 * ABB Project Constants
 * 
 * Static data and configuration for ABB application testing
 */

// Application URLs and endpoints
export const URLS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  DATA_SOURCES: '/data-sources',
  REPORTS: '/reports',
  VISUALIZATIONS: '/visualizations',
  SETTINGS: '/settings'
} as const;

// Test user credentials
export const TEST_USERS = {
  ANALYST: {
    username: process.env.ABB_ANALYST_USERNAME || 'abb.analyst@dispel.com',
    password: process.env.ABB_ANALYST_PASSWORD || 'AnalystPass123!',
    role: 'data_analyst'
  },
  MANAGER: {
    username: process.env.ABB_MANAGER_USERNAME || 'abb.manager@dispel.com',
    password: process.env.ABB_MANAGER_PASSWORD || 'ManagerPass123!',
    role: 'analytics_manager'
  },
  VIEWER: {
    username: process.env.ABB_VIEWER_USERNAME || 'abb.viewer@dispel.com',
    password: process.env.ABB_VIEWER_PASSWORD || 'ViewerPass123!',
    role: 'report_viewer'
  }
} as const;

// UI selectors
export const SELECTORS = {
  // Login page
  LOGIN_FORM: '[data-testid="abb-login-form"]',
  USERNAME_INPUT: '[data-testid="abb-username"]',
  PASSWORD_INPUT: '[data-testid="abb-password"]',
  LOGIN_BUTTON: '[data-testid="abb-login-button"]',
  
  // Navigation
  NAV_SIDEBAR: '[data-testid="abb-sidebar"]',
  USER_MENU: '[data-testid="abb-user-menu"]',
  LOGOUT_BUTTON: '[data-testid="abb-logout"]',
  
  // Dashboard
  ANALYTICS_OVERVIEW: '[data-testid="analytics-overview"]',
  DATA_METRICS: '[data-testid="data-metrics"]',
  RECENT_REPORTS: '[data-testid="recent-reports"]',
  CHART_CONTAINER: '[data-testid="chart-container"]',
  
  // Data Analysis
  DATA_TABLE: '[data-testid="data-table"]',
  FILTER_PANEL: '[data-testid="filter-panel"]',
  CHART_BUILDER: '[data-testid="chart-builder"]',
  EXPORT_BUTTON: '[data-testid="export-button"]',
  
  // Reports
  REPORT_LIST: '[data-testid="report-list"]',
  CREATE_REPORT_BUTTON: '[data-testid="create-report"]',
  REPORT_EDITOR: '[data-testid="report-editor"]',
  SAVE_REPORT_BUTTON: '[data-testid="save-report"]'
} as const;

// Test data
export const TEST_DATA = {
  SAMPLE_DATASET: {
    name: 'Test Analytics Data',
    type: 'csv',
    columns: ['timestamp', 'value', 'category'],
    rowCount: 1000
  },
  
  TEST_REPORT: {
    name: 'Automated Test Report',
    description: 'Report created by automated tests',
    type: 'dashboard',
    widgets: ['chart', 'table', 'metrics']
  },
  
  FILTER_CRITERIA: {
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    },
    category: 'test_data',
    threshold: 100
  }
} as const;

// Expected text content
export const EXPECTED_TEXT = {
  LOGIN_PAGE_TITLE: 'ABB Analytics Portal',
  DASHBOARD_TITLE: 'Analytics Dashboard',
  DATA_LOADED: 'Data loaded successfully',
  REPORT_SAVED: 'Report saved successfully',
  EXPORT_COMPLETE: 'Export completed',
  NO_DATA_AVAILABLE: 'No data available',
  ACCESS_DENIED: 'Insufficient permissions'
} as const;

// Timeouts
export const TIMEOUTS = {
  DATA_LOAD: 30000,
  CHART_RENDER: 15000,
  EXPORT_GENERATION: 45000,
  REPORT_SAVE: 20000,
  API_RESPONSE: 25000
} as const;

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  DATA_SOURCES: '/api/datasources',
  ANALYTICS: '/api/analytics',
  REPORTS: '/api/reports',
  EXPORT: '/api/export',
  CHARTS: '/api/charts'
} as const;
