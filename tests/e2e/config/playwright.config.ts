import { defineConfig, devices } from '@playwright/test';
import { TEST_ENV } from './test-env';

/**
 * Playwright configuration for E2E tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '../business-critical',
  
  // Maximum time one test can run
  timeout: TEST_ENV.TEST_TIMEOUT,
  
  // Test execution settings
  fullyParallel: false, // Run tests serially to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for DB isolation
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for tests - use environment variable or default
    baseURL: process.env.FRONTEND_URL || TEST_ENV.FRONTEND_URL || 'http://localhost:3000',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Run local dev server before tests (if needed)
  // webServer: {
  //   command: 'npm run dev',
  //   url: TEST_ENV.FRONTEND_URL,
  //   reuseExistingServer: !process.env.CI,
  // },
});

