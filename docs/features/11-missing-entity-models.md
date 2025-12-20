# Feature 11: Missing Entity Models Implementation

**Status:** ✅ Complete

## Description

Implement missing database models and routes for entities that were referenced in the frontend but lacked backend models. This ensures all entities have full CRUD functionality through the generic entity router.

## Implementation

### Models Created

1. **PropertyOwner** (`backend/src/models/property_owner.py`)
   - Links contacts to properties with ownership percentage
   - Table: `property_owners`
   - Route: `/api/propertyowner`

2. **Tenant** (`backend/src/models/tenant.py`)
   - Manages tenant/lease relationships
   - Links contacts to properties with lease details
   - Table: `tenants`
   - Route: `/api/tenant`

3. **Match** (`backend/src/models/match.py`)
   - Property-client matching system
   - Stores match scores and status
   - Table: `matches`
   - Route: `/api/match`

4. **ProjectLead** (`backend/src/models/project_lead.py`)
   - Tracks leads interested in projects
   - Links contacts to projects with interest level and budget
   - Table: `project_leads`
   - Route: `/api/projectlead`

5. **WorkOrder** (`backend/src/models/work_order.py`)
   - Work order management for property maintenance
   - Links properties, contacts, and suppliers
   - Table: `work_orders`
   - Route: `/api/workorder`

6. **DoNotCallList** (`backend/src/models/do_not_call_list.py`)
   - Marketing opt-out list
   - Stores phone numbers that should not be contacted
   - Table: `do_not_call_list`
   - Route: `/api/donotcalllist`

7. **Campaign** (`backend/src/models/campaign.py`)
   - Marketing campaign management
   - Tracks campaign name, dates, and status
   - Table: `campaigns`
   - Route: `/api/campaign`

8. **CampaignMetrics** (`backend/src/models/campaign_metrics.py`)
   - Campaign performance tracking
   - Links to campaigns with metrics (sent, delivered, opened, clicked, conversions)
   - Table: `campaign_metrics`
   - Route: `/api/campaignmetrics`

9. **AccountingDocument** (`backend/src/models/accounting_document.py`)
   - Accounting document management
   - Stores invoices, receipts, contracts with file URLs
   - Table: `accounting_documents`
   - Route: `/api/accountingdocuments`

### Migration Files Created

Separate migration files for each entity (extracted from combined migration files for better organization):

**Note:** Tables for property_owners, tenants, matches, and project_leads were originally created in `010_create_additional_tables.sql`. Separate migration files have been created for consistency and clarity:

- `013_create_property_owners.sql` - Property owners table
- `014_create_tenants.sql` - Tenants table  
- `015_create_matches.sql` - Matches table
- `016_create_project_leads.sql` - Project leads table
- `017_create_work_orders.sql` - Work orders table
- `018_create_do_not_call_list.sql` - Do not call list table
- `019_create_campaigns.sql` - Campaigns table
- `020_create_campaign_metrics.sql` - Campaign metrics table
- `021_create_accounting_documents.sql` - Accounting documents table

**Migration Order:**
- Migrations 013-016: Tables already exist from migration 010 (created for documentation/clarity)
- Migrations 017-021: New tables created for entities that were missing

### Routes Added

All entities registered in `backend/src/routes/entities.py`:
```python
router.include_router(create_entity_router("propertyowner", PropertyOwner))
router.include_router(create_entity_router("tenant", Tenant))
router.include_router(create_entity_router("match", Match))
router.include_router(create_entity_router("projectlead", ProjectLead))
router.include_router(create_entity_router("workorder", WorkOrder))
router.include_router(create_entity_router("donotcalllist", DoNotCallList))
router.include_router(create_entity_router("campaign", Campaign))
router.include_router(create_entity_router("campaignmetrics", CampaignMetrics))
router.include_router(create_entity_router("accountingdocuments", AccountingDocument))
```

## Dependencies

- Feature 3: Backend API Server - Required for generic entity router
- Feature 4: Database Schema - Required for table structure

## API Endpoints

All entities now support standard CRUD operations:

- `GET /api/{entity}s` - List entities (with `order_by` and `limit` query params)
- `GET /api/{entity}s/{id}` - Get entity by ID
- `POST /api/{entity}s` - Create entity
- `PUT /api/{entity}s/{id}` - Update entity
- `DELETE /api/{entity}s/{id}` - Delete entity

## Usage

### Frontend Usage

All entities are available in `src/api/entities/index.ts`:

```typescript
import { PropertyOwner, Tenant, Match, ProjectLead, WorkOrder } from '@/api/entities';

// List entities
const owners = await PropertyOwner.list("-created_date", 10);

// Get by ID
const owner = await PropertyOwner.get(123);

// Create
const newOwner = await PropertyOwner.create({
  contact_id: 1,
  property_id: 2,
  ownership_percentage: 50.0
});

// Update
await PropertyOwner.update(123, { ownership_percentage: 75.0 });

// Delete
await PropertyOwner.delete(123);
```

## Testing

```bash
# Run migrations
python backend/scripts/migrate.py

# Test endpoints
curl http://localhost:8000/api/propertyowner
curl http://localhost:8000/api/tenant
curl http://localhost:8000/api/match
```

## Notes

- All models follow SQLAlchemy conventions
- Foreign keys properly defined with cascade options
- Timestamps (created_date, updated_date) automatically managed
- Indexes created on foreign keys and frequently queried fields
- Generic entity router handles all CRUD operations automatically
- No custom business logic needed unless specific requirements arise

## Related Features

- Feature 3: Backend API Server - Provides the generic entity router
- Feature 4: Database Schema - Provides table definitions
- Feature 6: Frontend API Client Abstraction - Provides frontend entity classes

