/**
 * Test data factories
 * Generate realistic test data for entities
 */
import { APIRequestContext } from '@playwright/test';
import { TEST_ENV } from '../config/test-env';
import { getAuthHeaders } from './auth';
import { getEntityEndpoint } from './entity-endpoints';

/**
 * Contact factory
 */
export interface ContactData {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export function createContactData(overrides?: ContactData): ContactData {
  const id = Math.random().toString(36).substring(7);
  return {
    full_name: `Test Contact ${id}`,
    phone: `050-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    email: `test.contact.${id}@example.com`,
    address: `Test Street ${id}, Tel Aviv`,
    notes: `Test contact created for E2E tests`,
    ...overrides,
  };
}

/**
 * Property factory
 */
export interface PropertyData {
  contact_id?: number;
  category?: string;
  property_type?: string;
  city?: string;
  area?: string;
  street?: string;
  price?: number;
  rooms?: number;
}

export function createPropertyData(overrides?: PropertyData): PropertyData {
  const types = ['דירה', 'בית פרטי', 'משרד', 'חנות'];
  const cities = ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע'];
  const areas = ['מרכז', 'צפון', 'דרום'];
  
  return {
    category: 'מגורים',
    property_type: types[Math.floor(Math.random() * types.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
    area: areas[Math.floor(Math.random() * areas.length)],
    street: `Test Street ${Math.random().toString(36).substring(7)}`,
    price: Math.floor(Math.random() * 5000000) + 500000,
    rooms: Math.floor(Math.random() * 5) + 2,
    ...overrides,
  };
}

/**
 * Client factory
 */
export interface ClientData {
  contact_id?: number;
  request_type?: string;
  preferred_property_type?: string;
  budget?: number;
  preferred_rooms?: string;
  city?: string;
}

export function createClientData(overrides?: ClientData): ClientData {
  const types = ['דירה', 'בית פרטי', 'משרד'];
  const cities = ['תל אביב', 'ירושלים', 'חיפה'];
  
  return {
    request_type: 'קנייה',
    preferred_property_type: types[Math.floor(Math.random() * types.length)],
    budget: Math.floor(Math.random() * 4000000) + 1000000,
    preferred_rooms: String(Math.floor(Math.random() * 4) + 2),
    city: cities[Math.floor(Math.random() * cities.length)],
    ...overrides,
  };
}

/**
 * Supplier factory
 */
export interface SupplierData {
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export function createSupplierData(overrides?: SupplierData): SupplierData {
  const id = Math.random().toString(36).substring(7);
  return {
    name: `Test Supplier ${id}`,
    contact_person: `Contact Person ${id}`,
    phone: `050-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    email: `supplier.${id}@example.com`,
    address: `Supplier Address ${id}`,
    notes: `Test supplier`,
    ...overrides,
  };
}

/**
 * Marketing Lead factory
 */
export interface MarketingLeadData {
  contact_id?: number;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  budget?: number;
  neighborhood?: string;
  street?: string;
  rooms_min?: number;
  rooms_max?: number;
  client_type?: string;
  seriousness?: string;
  opt_out_whatsapp?: boolean;
  source?: string;
}

export function createMarketingLeadData(overrides?: MarketingLeadData): MarketingLeadData {
  const id = Math.random().toString(36).substring(7);
  return {
    phone_number: `050-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    first_name: `First${id}`,
    last_name: `Last${id}`,
    budget: Math.floor(Math.random() * 3000000) + 1000000,
    neighborhood: 'תל אביב',
    street: `Street ${id}`,
    rooms_min: 2,
    rooms_max: 4,
    client_type: 'קונה',
    seriousness: 'בינוני',
    opt_out_whatsapp: false,
    source: 'website',
    ...overrides,
  };
}

/**
 * Helper: Create entity via API
 */
export async function createEntity(
  apiContext: APIRequestContext | null,
  entityType: string,
  data: any
): Promise<any> {
  if (!apiContext) {
    throw new Error('API context not initialized. Ensure beforeEach has run.');
  }
  const endpointName = getEntityEndpoint(entityType);
  const response = await apiContext.post(
    `${TEST_ENV.API_BASE_URL}/${endpointName}`,
    {
      data,
      headers: getAuthHeaders(),
    }
  );
  
  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`Failed to create ${entityType}: ${response.status()} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * Helper: Create contact and return ID
 */
export async function createContact(
  apiContext: APIRequestContext,
  data?: ContactData
): Promise<number> {
  const contactData = createContactData(data);
  const result = await createEntity(apiContext, 'contact', contactData);
  return result.id;
}

/**
 * Helper: Create property and return ID
 */
export async function createProperty(
  apiContext: APIRequestContext,
  data?: PropertyData
): Promise<number> {
  const propertyData = createPropertyData(data);
  const result = await createEntity(apiContext, 'property', propertyData);
  return result.id;
}

/**
 * Helper: Create client and return ID
 */
export async function createClient(
  apiContext: APIRequestContext,
  data?: ClientData
): Promise<number> {
  const clientData = createClientData(data);
  const result = await createEntity(apiContext, 'client', clientData);
  return result.id;
}

/**
 * Helper: Create supplier and return ID
 */
export async function createSupplier(
  apiContext: APIRequestContext,
  data?: SupplierData
): Promise<number> {
  const supplierData = createSupplierData(data);
  const result = await createEntity(apiContext, 'supplier', supplierData);
  return result.id;
}

/**
 * Helper: Create marketing lead and return ID
 */
export async function createMarketingLead(
  apiContext: APIRequestContext,
  data?: MarketingLeadData
): Promise<number> {
  const leadData = createMarketingLeadData(data);
  const result = await createEntity(apiContext, 'marketinglead', leadData);
  return result.id;
}

