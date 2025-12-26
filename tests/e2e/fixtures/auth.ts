/**
 * Authentication token generation and management
 * Generates JWT token once per suite, reuses across tests
 */
import { APIRequestContext } from '@playwright/test';
import { TEST_ENV } from '../config/test-env';

let authToken: string | null = null;
let authContext: APIRequestContext | null = null;

/**
 * Generate JWT token by logging in
 * Call this once per test suite
 */
export async function generateAuthToken(
  apiContext: APIRequestContext
): Promise<string> {
  if (authToken) {
    return authToken;
  }
  
  authContext = apiContext;
  
  try {
    // Login to get token (OAuth2PasswordRequestForm expects form-urlencoded)
    const formData = new URLSearchParams();
    formData.append('username', TEST_ENV.TEST_USER_EMAIL);
    formData.append('password', TEST_ENV.TEST_USER_PASSWORD);
    
    const response = await apiContext.post(`${TEST_ENV.API_BASE_URL}/auth/login`, {
      data: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status()} - ${errorText}`);
    }
    
    const tokenData = await response.json();
    authToken = tokenData.access_token;
    
    if (!authToken) {
      throw new Error('No access token received from login');
    }
    
    console.log('✓ Generated auth token');
    return authToken;
  } catch (error) {
    console.error(`✗ Failed to generate auth token: ${error}`);
    throw error;
  }
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string {
  if (!authToken) {
    throw new Error('Auth token not generated. Call generateAuthToken() first.');
  }
  return authToken;
}

/**
 * Get authenticated API request context
 */
export function getAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Reset auth token (for testing different users/roles)
 */
export function resetAuthToken(): void {
  authToken = null;
  authContext = null;
}

/**
 * Get current user info
 */
export async function getCurrentUser(apiContext: APIRequestContext): Promise<any> {
  const response = await apiContext.get(`${TEST_ENV.API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok()) {
    throw new Error(`Failed to get current user: ${response.status()}`);
  }
  
  return response.json();
}

