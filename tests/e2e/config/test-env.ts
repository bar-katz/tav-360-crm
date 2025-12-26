/**
 * Test environment configuration
 */
export const TEST_ENV = {
  // Backend API URL
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Database connection for test isolation
  TEST_DB_HOST: process.env.TEST_DB_HOST || 'localhost',
  TEST_DB_PORT: parseInt(process.env.TEST_DB_PORT || '5432'),
  TEST_DB_USER: process.env.TEST_DB_USER || 'tav360',
  TEST_DB_PASSWORD: process.env.TEST_DB_PASSWORD || 'tav360secret',
  TEST_DB_NAME_PREFIX: process.env.TEST_DB_NAME_PREFIX || 'tav360_test',
  
  // Auth credentials for test user
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'testpassword123',
  TEST_USER_ROLE: process.env.TEST_USER_ROLE || 'admin',
  
  // Test execution settings
  TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '60000'), // 60 seconds
  SCREENSHOT_ON_FAILURE: process.env.SCREENSHOT_ON_FAILURE !== 'false',
  
  // Playwright settings
  HEADLESS: process.env.HEADLESS !== 'false',
  SLOW_MO: parseInt(process.env.SLOW_MO || '0'),
} as const;

