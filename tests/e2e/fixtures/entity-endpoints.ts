/**
 * Entity endpoint name mapping
 * Maps entity types to their correct API endpoint names
 * Backend pluralizes by adding 's', so we need to use singular base names
 */
export const ENTITY_ENDPOINTS: Record<string, string> = {
  // Backend pluralizes by adding 's' to entity name (even if incorrect)
  'contact': 'contacts',
  'property': 'propertys', // Backend uses "propertys" (incorrect plural, but that's what it is)
  'client': 'clients',
  'meeting': 'meetings',
  'task': 'tasks',
  'supplier': 'suppliers',
  'project': 'projects',
  'campaign': 'campaigns',
  
  // Special cases (backend uses these exact names)
  'servicecall': 'servicecalls',
  'marketinglead': 'marketingleads',
  'marketinglog': 'marketinglogs',
  'propertyowner': 'propertyowners',
  'tenant': 'tenants',
  'match': 'matchs', // Backend uses "matchs" (incorrect plural)
  'projectlead': 'projectleads',
  'workorder': 'workorders',
  'donotcalllist': 'donotcalllists',
  'campaignmetrics': 'campaignmetricss', // Backend adds 's' to already plural
  'accountingdocuments': 'accountingdocumentss', // Backend adds 's' to already plural
};

/**
 * Get correct endpoint name for entity type
 */
export function getEntityEndpoint(entityType: string): string {
  return ENTITY_ENDPOINTS[entityType.toLowerCase()] || `${entityType}s`;
}

