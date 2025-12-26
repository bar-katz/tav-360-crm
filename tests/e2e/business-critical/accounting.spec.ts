/**
 * E2E Tests: Accounting Documents (Financial Integrity)
 * Tests accounting document creation and financial precision
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { setupTestDatabase, teardownTestDatabase, getMainDbClient } from '../fixtures/database';
import { generateAuthToken } from '../fixtures/auth';
import { initTestLog, logStep, logError, captureScreenshotOnFailure, saveTestLogs } from '../fixtures/observability';
import { createAPIClient } from '../fixtures/api-client';
import { createContact, createProperty } from '../fixtures/test-data';
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

test.describe('Accounting Documents', () => {
  test('E2E_ACCT_001: Verify accounting document creation with file attachment', async ({ page }) => {
    initTestLog('E2E_ACCT_001');
    
    try {
      logStep('setup', 'Creating property and contact');
      
      const contact = await createContact(apiContext);
      const property = await createProperty(apiContext, { contact_id: contact });
      
      // Create test PDF file
      const testFileDir = path.join(__dirname, '../../test-data');
      if (!fs.existsSync(testFileDir)) {
        fs.mkdirSync(testFileDir, { recursive: true });
      }
      
      const testFilePath = path.join(testFileDir, 'test-document.pdf');
      const testFileContent = Buffer.from('%PDF-1.4\nTest PDF Content');
      fs.writeFileSync(testFilePath, testFileContent);
      
      logStep('navigate', 'Navigating to Accounting Documents page');
      await navigateTo(page, '/accounting');
      await page.waitForTimeout(1000); // Wait for page to load
      
      logStep('create_document', 'Creating accounting document via API');
      
      const documentType = 'invoice';
      const documentNumber = 'INV-001';
      const amount = 1234.56;
      const documentDate = '2025-01-15';
      
      // Upload file first using Playwright's file upload
      const uploadResponse = await apiContext.post(
        `${process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload`,
        {
          multipart: {
            file: {
              name: 'test-document.pdf',
              mimeType: 'application/pdf',
              buffer: testFileContent,
            },
          },
          headers: {
            'Authorization': `Bearer ${require('../fixtures/auth').getAuthToken()}`,
          },
        }
      );
      
      expect(uploadResponse.ok()).toBe(true);
      const uploadResult = await uploadResponse.json();
      const fileUrl = uploadResult.file_url || uploadResult.url;
      
      expect(fileUrl).toBeDefined();
      
      // Create accounting document via API
      const document = await apiClient.createEntity('accountingdocuments', {
        property_id: property,
        contact_id: contact,
        document_type: documentType,
        document_number: documentNumber,
        amount: amount,
        date: documentDate,
        file_url: fileUrl,
      });
      
      expect(document).toBeDefined();
      
      logStep('verify_persistence', 'Verifying document persisted');
      
      // Document already created above, verify it
      // Refresh page to see the new document in UI
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      expect(document.document_type).toBe(documentType);
      expect(document.document_number).toBe(documentNumber);
      expect(parseFloat(document.amount)).toBe(amount);
      expect(document.file_url).toBeDefined();
      
      // Verify file accessible
      const fileResponse = await apiContext.get(document.file_url);
      expect(fileResponse.ok()).toBe(true);
      
      // Verify amount precision (2 decimals) - backend writes to main database
      const db = await getMainDbClient();
      const dbDocument = await db.query(
        'SELECT * FROM accounting_documents WHERE property_id = $1 AND contact_id = $2',
        [property, contact]
      );
      
      expect(dbDocument.rows.length).toBe(1);
      expect(parseFloat(dbDocument.rows[0].amount)).toBe(amount);
      expect(dbDocument.rows[0].file_url).toBeDefined();
      
      await db.end();
      
      // Cleanup test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
      
      logStep('complete', 'Test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_ACCT_001');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_ACCT_001');
    }
  });
  
  test('E2E_ACCT_002: Verify accounting document amount precision (no rounding errors)', async ({ page }) => {
    initTestLog('E2E_ACCT_002');
    
    try {
      logStep('setup', 'Creating property and contact');
      
      const contact = await createContact(apiContext);
      const property = await createProperty(apiContext, { contact_id: contact });
      
      logStep('create_document', 'Creating document with precise amount');
      
      const amount = 1234.56;
      
      // Create document via API for precision testing
      const document = await apiClient.createEntity('accountingdocuments', {
        property_id: property,
        contact_id: contact,
        document_type: 'invoice',
        document_number: 'INV-PRECISION-001',
        amount: amount,
        date: '2025-01-15',
      });
      
      logStep('verify_precision', 'Verifying amount precision maintained');
      
      // Retrieve document
      const retrieved = await apiClient.getEntity('accountingdocuments', document.id);
      
      expect(parseFloat(retrieved.amount)).toBe(amount);
      
      // Verify database precision (backend writes to main database)
      const db = await getMainDbClient();
      const dbDocument = await db.query(
        'SELECT amount FROM accounting_documents WHERE id = $1',
        [document.id]
      );
      
      const dbAmount = parseFloat(dbDocument.rows[0].amount);
      expect(dbAmount).toBe(amount);
      
      // Verify no rounding (exact match)
      expect(dbAmount.toString()).toBe(amount.toString());
      
      await db.end();
      
      logStep('complete', 'Test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_ACCT_002');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_ACCT_002');
    }
  });
});

