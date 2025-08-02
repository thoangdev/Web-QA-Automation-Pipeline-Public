/**
 * DSMD Project Constants
 * 
 * Static data and configuration for DSMD application testing
 */

// Application URLs and endpoints
export const URLS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DEVICES: '/devices',
  MONITORING: '/monitoring',
  CONFIGURATION: '/config',
  ALERTS: '/alerts',
  SYSTEM: '/system'
} as const;

// Test user credentials
export const TEST_USERS = {
  ADMIN: {
    username: process.env.DSMD_ADMIN_USERNAME || 'dsmd.admin@dispel.com',
    password: process.env.DSMD_ADMIN_PASSWORD || 'AdminPass123!',
    role: 'system_admin'
  },
  OPERATOR: {
    username: process.env.DSMD_OPERATOR_USERNAME || 'dsmd.operator@dispel.com',
    password: process.env.DSMD_OPERATOR_PASSWORD || 'OperatorPass123!',
    role: 'device_operator'
  },
  MONITOR: {
    username: process.env.DSMD_MONITOR_USERNAME || 'dsmd.monitor@dispel.com',
    password: process.env.DSMD_MONITOR_PASSWORD || 'MonitorPass123!',
    role: 'monitor_user'
  }
} as const;

// UI selectors
export const SELECTORS = {
  // Login page
  LOGIN_FORM: '[data-testid="dsmd-login-form"]',
  USERNAME_INPUT: '[data-testid="dsmd-username"]',
  PASSWORD_INPUT: '[data-testid="dsmd-password"]',
  LOGIN_BUTTON: '[data-testid="dsmd-login-button"]',
  
  // Navigation
  MAIN_NAV: '[data-testid="dsmd-navigation"]',
  USER_PROFILE: '[data-testid="dsmd-user-profile"]',
  LOGOUT_BUTTON: '[data-testid="dsmd-logout"]',
  
  // Dashboard
  SYSTEM_STATUS: '[data-testid="system-status"]',
  DEVICE_GRID: '[data-testid="device-grid"]',
  ALERT_PANEL: '[data-testid="alert-panel"]',
  METRICS_DISPLAY: '[data-testid="metrics-display"]',
  
  // Device Management
  DEVICE_LIST: '[data-testid="device-list"]',
  DEVICE_CARD: '[data-testid="device-card"]',
  ADD_DEVICE_BUTTON: '[data-testid="add-device"]',
  DEVICE_CONFIG_PANEL: '[data-testid="device-config"]',
  
  // Monitoring
  MONITORING_DASHBOARD: '[data-testid="monitoring-dashboard"]',
  REAL_TIME_CHART: '[data-testid="realtime-chart"]',
  STATUS_INDICATORS: '[data-testid="status-indicators"]',
  THRESHOLD_SETTINGS: '[data-testid="threshold-settings"]'
} as const;

// Test data
export const TEST_DATA = {
  TEST_DEVICE: {
    name: 'Test Device 001',
    type: 'sensor',
    location: 'Test Lab A',
    ip_address: '192.168.1.100',
    model: 'TestSensor-X1'
  },
  
  CONFIGURATION: {
    poll_interval: 30,
    alert_threshold: 85,
    max_retries: 3,
    timeout: 5000
  },
  
  ALERT_CRITERIA: {
    severity: 'critical',
    type: 'threshold_exceeded',
    auto_resolve: true
  }
} as const;

// Expected text content
export const EXPECTED_TEXT = {
  LOGIN_PAGE_TITLE: 'DSMD System Portal',
  DASHBOARD_TITLE: 'Device Monitoring Dashboard',
  DEVICE_ADDED: 'Device added successfully',
  CONFIG_SAVED: 'Configuration saved',
  SYSTEM_HEALTHY: 'System status: Healthy',
  OFFLINE_STATUS: 'Device offline',
  CONNECTION_ERROR: 'Connection failed'
} as const;

// Timeouts
export const TIMEOUTS = {
  DEVICE_DISCOVERY: 20000,
  CONFIG_SAVE: 15000,
  STATUS_UPDATE: 10000,
  CHART_LOAD: 25000,
  ALERT_PROCESSING: 30000
} as const;

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  DEVICES: '/api/devices',
  MONITORING: '/api/monitoring',
  CONFIG: '/api/configuration',
  ALERTS: '/api/alerts',
  SYSTEM: '/api/system/status'
} as const;
