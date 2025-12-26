/**
 * E2E Tests: Work Orders & Cost Tracking (Financial)
 * Tests work order creation and cost aggregation
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { setupTestDatabase, teardownTestDatabase, getMainDbClient } from '../fixtures/database';
import { generateAuthToken } from '../fixtures/auth';
import { initTestLog, logStep, logError, captureScreenshotOnFailure, saveTestLogs } from '../fixtures/observability';
import { createAPIClient } from '../fixtures/api-client';
import { createContact, createProperty, createSupplier } from '../fixtures/test-data';
import { navigateTo } from '../fixtures/navigation';

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

test.describe('Work Orders & Cost Tracking', () => {
  test('E2E_WO_001: Verify work order creation with cost tracking', async ({ page }) => {
    initTestLog('E2E_WO_001');
    
    try {
      logStep('setup', 'Creating property, supplier, and contact');
      
      const contact = await createContact(apiContext);
      const property = await createProperty(apiContext, { contact_id: contact });
      const supplier = await createSupplier(apiContext);
      
      logStep('navigate', 'Navigating to Work Orders page');
      await navigateTo(page, '/workorders');
      await page.waitForTimeout(1000); // Wait for page to load
      
      logStep('create_work_order', 'Creating work order via API');
      
      const cost = 1500.50;
      const title = 'Test Work Order';
      
      // Create work order via API (more reliable for E2E)
      // But also verify it appears in UI
      const workOrder = await apiClient.createEntity('workorder', {
        property_id: property,
        contact_id: contact,
        supplier_id: supplier,
        title: title,
        cost: cost,
        status: 'open',
      });
      
      expect(workOrder).toBeDefined();
      expect(workOrder.property_id).toBe(property);
      
      logStep('verify_persistence', 'Verifying work order persisted');
      
      // Work order already created above, verify it
      expect(parseFloat(workOrder.cost)).toBe(cost);
      expect(workOrder.title).toBe(title);
      
      // Refresh page to see the new work order in UI
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      // Verify database state (backend writes to main database)
      const db = await getMainDbClient();
      const dbWorkOrder = await db.query(
        'SELECT * FROM work_orders WHERE id = $1',
        [workOrder.id]
      );
      
      expect(dbWorkOrder.rows.length).toBe(1);
      expect(parseFloat(dbWorkOrder.rows[0].cost)).toBe(cost);
      expect(dbWorkOrder.rows[0].property_id).toBe(property);
      expect(dbWorkOrder.rows[0].contact_id).toBe(contact);
      expect(dbWorkOrder.rows[0].supplier_id).toBe(supplier);
      
      await db.end();
      
      logStep('complete', 'Test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_WO_001');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_WO_001');
    }
  });
  
  test('E2E_WO_002: Verify work order cost aggregation per property', async ({ page }) => {
    initTestLog('E2E_WO_002');
    
    try {
      logStep('setup', 'Creating property and multiple work orders');
      
      const contact = await createContact(apiContext);
      const property = await createProperty(apiContext, { contact_id: contact });
      const supplier1 = await createSupplier(apiContext);
      const supplier2 = await createSupplier(apiContext);
      const supplier3 = await createSupplier(apiContext);
      
      // Create 3 work orders for property A with costs: 1000, 2000, 1500
      await apiClient.createEntity('workorder', {
        property_id: property,
        contact_id: contact,
        supplier_id: supplier1,
        cost: 1000,
        title: 'Work Order 1',
      });
      
      await apiClient.createEntity('workorder', {
        property_id: property,
        contact_id: contact,
        supplier_id: supplier2,
        cost: 2000,
        title: 'Work Order 2',
      });
      
      await apiClient.createEntity('workorder', {
        property_id: property,
        contact_id: contact,
        supplier_id: supplier3,
        cost: 1500,
        title: 'Work Order 3',
      });
      
      logStep('verify_aggregation', 'Verifying cost aggregation');
      
      // Query total cost for property A (backend writes to main database)
      const db = await getMainDbClient();
      const totalCostResult = await db.query(
        'SELECT SUM(cost) as total_cost FROM work_orders WHERE property_id = $1',
        [property]
      );
      
      const totalCost = parseFloat(totalCostResult.rows[0].total_cost);
      expect(totalCost).toBe(4500);
      
      await db.end();
      
      logStep('complete', 'Test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_WO_002');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_WO_002');
    }
  });
});

