/**
 * Navigation helper utilities
 */
import { Page } from '@playwright/test';
import { TEST_ENV } from '../config/test-env';

/**
 * Navigate to a page using absolute URL
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  const frontendUrl = TEST_ENV.FRONTEND_URL || 'http://localhost:3000';
  const url = path.startsWith('http') ? path : `${frontendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  
  try {
    // Use domcontentloaded instead of networkidle to avoid waiting for polling requests
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to be ready - wait for body or a common element
    await page.waitForSelector('body', { timeout: 10000 }).catch(() => {
      // If body doesn't appear, page might still be loading
    });
    
    // Wait a short time for page to initialize
    await page.waitForTimeout(1000);
  } catch (error) {
    // If navigation fails, try to get more info
    const currentUrl = page.url();
    throw new Error(`Failed to navigate to ${url}. Current URL: ${currentUrl}. Error: ${error}`);
  }
}
