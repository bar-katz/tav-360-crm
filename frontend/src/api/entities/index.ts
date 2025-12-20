/**
 * Entity factory - creates entity classes that extend BaseEntity
 */
import { BaseEntity } from './base';

function createEntity(entityName: string) {
  class Entity extends BaseEntity {
    protected static entityName = entityName;
  }
  return Entity;
}

// Create entity classes for all entities
export const Contact = createEntity('contact');
export const Property = createEntity('property');
export const Client = createEntity('client');
export const Meeting = createEntity('meeting');
export const Task = createEntity('task');
export const ServiceCall = createEntity('servicecall');
export const Supplier = createEntity('supplier');
export const Project = createEntity('project');
export const PropertyBrokerage = createEntity('property');
export const BuyersRenters = createEntity('client');
export const Matches = createEntity('match');
export const BuyersBrokerage = createEntity('client');
export const PropertyInventory = createEntity('property');
export const MatchesBrokerage = createEntity('match');
export const PropertyOwner = createEntity('propertyowner');
export const Tenant = createEntity('tenant');
export const WorkOrder = createEntity('workorder');
export const ProjectLead = createEntity('projectlead');
export const MarketingLead = createEntity('marketinglead');
export const MarketingLog = createEntity('marketinglog');
export const DoNotCallList = createEntity('donotcalllist');
export const Campaign = createEntity('campaign');
export const CampaignMetrics = createEntity('campaignmetrics');
export const AccountingDocuments = createEntity('accountingdocuments');

// Auth entity - special handling
import { apiClient } from '../apiClient';

export class User extends BaseEntity {
  protected static entityName = 'user';
  
  static async me() {
    return apiClient.get('/auth/me');
  }
}

