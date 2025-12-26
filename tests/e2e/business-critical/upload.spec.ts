/**
import { TEST_ENV } from '../config/test-env';
 * E2E Tests: File Uploads (Data Integrity)
 * Tests file upload functionality, validation, and security
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { setupTestDatabase, teardownTestDatabase } from '../fixtures/database';
import { generateAuthToken } from '../fixtures/auth';
import { initTestLog, logStep, logError, captureScreenshotOnFailure, saveTestLogs } from '../fixtures/observability';
import { createAPIClient } from '../fixtures/api-client';
import { navigateTo } from '../fixtures/navigation';
import * as fs from 'fs';
import * as path from 'path';

let apiContext: APIRequestContext;
let apiClient: any;

test.beforeEach(async ({ request }) => {
  await setupTestDatabase();
  apiContext = request;
  apiClient = createAPIClient(apiContext);
  await generateAuthToken(apiContext);
});

test.afterAll(async () => {
  await teardownTestDatabase();
});

test.describe('File Uploads', () => {
  test('E2E_UPLOAD_001: Verify file upload creates accessible file', async ({ page }) => {
    initTestLog('E2E_UPLOAD_001');
    
    try {
      logStep('setup', 'Creating test PDF file');
      
      const testFileDir = path.join(__dirname, '../../test-data');
      if (!fs.existsSync(testFileDir)) {
        fs.mkdirSync(testFileDir, { recursive: true });
      }
      
      const originalFileName = 'test-document.pdf';
      const testFilePath = path.join(testFileDir, originalFileName);
      const testFileContent = Buffer.from('%PDF-1.4\nTest PDF Content for E2E Upload Test');
      fs.writeFileSync(testFilePath, testFileContent);
      
      logStep('navigate', 'Navigating to Upload page');
      await navigateTo(page, '/upload');
      await page.waitForTimeout(1000); // Wait for page to load
      
      logStep('upload_file', 'Uploading file via API');
      
      // Upload file via API
      const fileBuffer = fs.readFileSync(testFilePath);
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      formData.append('file', blob, originalFileName);
      
      const uploadResponse = await apiContext.post(
        `${process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload`,
        {
          multipart: {
            file: {
              name: originalFileName,
              mimeType: 'application/pdf',
              buffer: fileBuffer,
            },
          },
          headers: {
            'Authorization': `Bearer ${require('../fixtures/auth').getAuthToken()}`,
          },
        }
      );
      
      expect(uploadResponse.ok()).toBe(true);
      const uploadResult = await uploadResponse.json();
      
      logStep('verify_upload', 'Verifying file uploaded and accessible');
      
      // Verify file_url returned
      expect(uploadResult.file_url).toBeDefined();
      expect(uploadResult.file_url).toContain('/uploads/');
      expect(uploadResult.file_id).toBeDefined();
      
      // Verify file stored with UUID filename (not original name)
      const fileName = uploadResult.file_url.split('/').pop();
      expect(fileName).not.toBe(originalFileName);
      expect(fileName).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i);
      
      // Verify file accessible at file_url
      const fileResponse = await apiContext.get(uploadResult.file_url);
      expect(fileResponse.ok()).toBe(true);
      
      // Verify file content matches original
      const downloadedContent = await fileResponse.body();
      expect(Buffer.from(downloadedContent).toString()).toBe(testFileContent.toString());
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
      
      logStep('complete', 'Test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_UPLOAD_001');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_UPLOAD_001');
    }
  });
  
  test('E2E_UPLOAD_002: Verify file upload size validation', async ({ page }) => {
    initTestLog('E2E_UPLOAD_002');
    
    try {
      logStep('setup', 'Creating test file > 10MB');
      
      const testFileDir = path.join(__dirname, '../../test-data');
      if (!fs.existsSync(testFileDir)) {
        fs.mkdirSync(testFileDir, { recursive: true });
      }
      
      const testFilePath = path.join(testFileDir, 'large-file.pdf');
      // Create file larger than 10MB
      const largeContent = Buffer.alloc(11 * 1024 * 1024, 'A'); // 11MB
      fs.writeFileSync(testFilePath, largeContent);
      
      logStep('attempt_upload', 'Attempting to upload large file');
      
      const fileBuffer = fs.readFileSync(testFilePath);
      
      const uploadResponse = await apiContext.post(
        `${process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload`,
        {
          multipart: {
            file: {
              name: 'large-file.pdf',
              mimeType: 'application/pdf',
              buffer: fileBuffer,
            },
          },
          headers: {
            'Authorization': `Bearer ${require('../fixtures/auth').getAuthToken()}`,
          },
          failOnStatusCode: false,
        }
      );
      
      logStep('verify_validation', 'Verifying size limit enforced');
      
      // Should return 400 error
      expect(uploadResponse.status()).toBe(400);
      
      const errorText = await uploadResponse.text();
      expect(errorText.toLowerCase()).toContain('size') || expect(errorText.toLowerCase()).toContain('large');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
      
      logStep('complete', 'Test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_UPLOAD_002');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_UPLOAD_002');
    }
  });
  
  test('E2E_UPLOAD_003: Verify file upload type validation', async ({ page }) => {
    initTestLog('E2E_UPLOAD_003');
    
    try {
      logStep('setup', 'Creating test file with disallowed extension');
      
      const testFileDir = path.join(__dirname, '../../test-data');
      if (!fs.existsSync(testFileDir)) {
        fs.mkdirSync(testFileDir, { recursive: true });
      }
      
      const testFilePath = path.join(testFileDir, 'test-file.exe');
      const testContent = Buffer.from('MZ\x90\x00\x03\x00\x00\x00'); // EXE header
      fs.writeFileSync(testFilePath, testContent);
      
      logStep('attempt_upload', 'Attempting to upload .exe file');
      
      const fileBuffer = fs.readFileSync(testFilePath);
      
      const uploadResponse = await apiContext.post(
        `${process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload`,
        {
          multipart: {
            file: {
              name: 'test-file.exe',
              mimeType: 'application/x-msdownload',
              buffer: fileBuffer,
            },
          },
          headers: {
            'Authorization': `Bearer ${require('../fixtures/auth').getAuthToken()}`,
          },
          failOnStatusCode: false,
        }
      );
      
      logStep('verify_validation', 'Verifying file type validation enforced');
      
      // Should return 400 error
      expect(uploadResponse.status()).toBe(400);
      
      const errorText = await uploadResponse.text();
      expect(errorText.toLowerCase()).toContain('type') || expect(errorText.toLowerCase()).toContain('allowed');
      
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
      
      logStep('complete', 'Test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_UPLOAD_003');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_UPLOAD_003');
    }
  });
});

