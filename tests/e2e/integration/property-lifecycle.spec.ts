/**
import { TEST_ENV } from '../config/test-env';
 * E2E Tests: Property Lifecycle Integration
 * Tests complete property lifecycle: Create → Add Owner → Add Tenant → Create Work Order
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

test.describe('Property Lifecycle Integration', () => {
  test('E2E_INTEG_001: Verify property lifecycle maintains data integrity', async ({ page }) => {
    initTestLog('E2E_INTEG_001');
    
    try {
      logStep('navigate', 'Navigating to Properties page');
      await navigateTo(page, '/properties');
      await page.waitForTimeout(1000); // Wait for page to load
      
      logStep('step1', 'Creating contacts');
      
      const ownerContact = await createContact(apiContext, {
        full_name: 'Property Owner',
        email: 'owner@example.com',
      });
      
      const tenantContact = await createContact(apiContext, {
        full_name: 'Property Tenant',
        email: 'tenant@example.com',
      });
      
      const supplierContact = await createContact(apiContext, {
        full_name: 'Supplier Contact',
        email: 'supplier@example.com',
      });
      
      logStep('step2', 'Creating property');
      
      const property = await createProperty(apiContext, {
        contact_id: ownerContact,
        price: 2000000,
        property_type: 'דירה',
        city: 'תל אביב',
        rooms: 3,
      });
      
      logStep('step3', 'Adding property owner');
      
      const propertyOwner = await apiClient.createEntity('propertyowner', {
        contact_id: ownerContact,
        property_id: property,
        ownership_percentage: 100,
        notes: 'Full ownership',
      });
      
      logStep('step4', 'Adding tenant');
      
      const tenant = await apiClient.createEntity('tenant', {
        contact_id: tenantContact,
        property_id: property,
        lease_start_date: '2025-01-01',
        lease_end_date: '2025-12-31',
        monthly_rent: 6000,
        deposit: 12000,
      });
      
      logStep('step5', 'Creating work order');
      
      const supplier = await createSupplier(apiContext);
      
      const workOrder = await apiClient.createEntity('workorder', {
        property_id: property,
        contact_id: supplierContact,
        supplier_id: supplier,
        title: 'Maintenance Work Order',
        description: 'Property maintenance',
        cost: 2500,
        status: 'open',
      });
      
      logStep('step6', 'Verifying all relationships intact');
      
      // Verify Property → PropertyOwner relationship
      // Use main DB client since backend writes to main database
      const db = await getMainDbClient();
      
      const propertyOwners = await db.query(
        'SELECT * FROM property_owners WHERE property_id = $1',
        [property]
      );
      expect(propertyOwners.rows.length).toBe(1);
      expect(propertyOwners.rows[0].contact_id).toBe(ownerContact);
      // ownership_percentage might be stored as numeric (100.00) or string ('100')
      const ownershipPct = propertyOwners.rows[0].ownership_percentage;
      expect(ownershipPct === '100' || ownershipPct === 100 || parseFloat(String(ownershipPct)) === 100).toBe(true);
      
      // Verify Property → Tenant relationship
      const tenants = await db.query(
        'SELECT * FROM tenants WHERE property_id = $1',
        [property]
      );
      expect(tenants.rows.length).toBe(1);
      expect(tenants.rows[0].contact_id).toBe(tenantContact);
      expect(parseFloat(tenants.rows[0].monthly_rent)).toBe(6000);
      
      // Verify Property → WorkOrder relationship
      const workOrders = await db.query(
        'SELECT * FROM work_orders WHERE property_id = $1',
        [property]
      );
      expect(workOrders.rows.length).toBe(1);
      expect(workOrders.rows[0].supplier_id).toBe(supplier);
      expect(parseFloat(workOrders.rows[0].cost)).toBe(2500);
      
      logStep('step7', 'Querying property with all relationships');
      
      // Query property and verify all relationships
      const propertyData = await apiClient.getEntity('property', property);
      expect(propertyData.id).toBe(property);
      
      // Verify data consistency
      const propertyWithRelations = await db.query(`
        SELECT 
          p.*,
          COUNT(DISTINCT po.id) as owner_count,
          COUNT(DISTINCT t.id) as tenant_count,
          COUNT(DISTINCT wo.id) as work_order_count
        FROM properties p
        LEFT JOIN property_owners po ON po.property_id = p.id
        LEFT JOIN tenants t ON t.property_id = p.id
        LEFT JOIN work_orders wo ON wo.property_id = p.id
        WHERE p.id = $1
        GROUP BY p.id
      `, [property]);
      
      expect(propertyWithRelations.rows.length).toBe(1);
      expect(parseInt(propertyWithRelations.rows[0].owner_count)).toBe(1);
      expect(parseInt(propertyWithRelations.rows[0].tenant_count)).toBe(1);
      expect(parseInt(propertyWithRelations.rows[0].work_order_count)).toBe(1);
      
      await db.end();
      
      logStep('complete', 'Property lifecycle test completed successfully');
    } catch (error) {
      await captureScreenshotOnFailure(page, 'E2E_INTEG_001');
      logError(error as Error);
      throw error;
    } finally {
      saveTestLogs('E2E_INTEG_001');
    }
  });
});

