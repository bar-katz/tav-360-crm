# Feature 6: Frontend API Client Abstraction

**Status:** ✅ Complete  
**Branch:** `feature/api-client-abstraction`

## Description

Create an abstraction layer to replace `@base44/sdk` calls throughout the frontend. This enables switching between Base44 and custom backend.

## Implementation

### Core Components

#### API Client (`src/api/apiClient.ts`)
- HTTP client wrapper using Fetch API
- Automatic token injection from localStorage
- Error handling and response parsing
- Support for GET, POST, PUT, DELETE methods
- FormData support for file uploads

#### Base Entity Class (`src/api/entities/base.ts`)
- Generic CRUD operations
- `list(orderBy?, limit?)` - List with ordering and pagination
- `get(id)` - Get by ID
- `create(data)` - Create new entity
- `update(id, data)` - Update entity
- `delete(id)` - Delete entity

#### Entity Factory (`src/api/entities/index.ts`)
- Creates entity classes dynamically
- Each entity extends BaseEntity
- Sets entity name for API routing
- Special handling for User entity (auth methods)

#### Entity Exports (`src/api/entities.ts`)
- Re-exports all entities
- Maintains backward compatibility
- Single import point for components

### Entity Classes Created

All entities follow the same pattern:
- Contact, Property, Client, Meeting, Task
- ServiceCall, Supplier, Project
- PropertyBrokerage, BuyersBrokerage, PropertyOwner
- Tenant, ProjectLead, MarketingLead, MarketingLog
- Matches, MatchesBrokerage, WorkOrder
- DoNotCallList, Campaign, CampaignMetrics, AccountingDocuments

### Special Entities

#### User Entity
- Extends BaseEntity
- Additional `me()` method for `/api/auth/me`
- Used for authentication

### Dependencies

- Feature 2 (Environment Configuration) - For API base URL
- Feature 5 (JWT Authentication) - For token management

## API Client Features

### Automatic Authentication
```typescript
// Token automatically added to headers
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Error Handling
```typescript
// Throws errors with response data
try {
  await Contact.list();
} catch (error) {
  console.error(error.response.data.detail);
}
```

### Query Parameters
```typescript
// Ordering and pagination
Contact.list("-created_date", 10)
// GET /api/contacts?order_by=-created_date&limit=10
```

## Usage Examples

### List Entities
```typescript
import { Contact } from '@/api/entities';

// List all contacts
const contacts = await Contact.list();

// List with ordering
const recentContacts = await Contact.list("-created_date", 10);
```

### Get Entity
```typescript
const contact = await Contact.get(123);
```

### Create Entity
```typescript
const newContact = await Contact.create({
  full_name: "John Doe",
  phone: "050-1234567",
  email: "john@example.com"
});
```

### Update Entity
```typescript
await Contact.update(123, {
  phone: "050-9876543"
});
```

### Delete Entity
```typescript
await Contact.delete(123);
```

### Get Current User
```typescript
import { User } from '@/api/entities';

const currentUser = await User.me();
```

## Migration from Base44

### Before (Base44)
```typescript
import { Contact } from '@/api/entities';
// Contact was base44.entities.Contact
const contacts = await Contact.list("-created_date");
```

### After (Custom API)
```typescript
import { Contact } from '@/api/entities';
// Contact is now custom API client entity
const contacts = await Contact.list("-created_date");
// Same API, different implementation
```

## Benefits

1. **Consistency:** Same API across all entities
2. **Type Safety:** TypeScript support
3. **Flexibility:** Easy to switch backends
4. **Maintainability:** Single source of truth for API calls
5. **Error Handling:** Centralized error handling

## Notes

- All entity methods are static (no instance needed)
- Ordering uses `-` prefix for descending (e.g., `-created_date`)
- Limit defaults to 100 if not specified
- Error responses include `response.data.detail` for user-friendly messages
- Empty responses handled gracefully

## Testing

```typescript
// Test in browser console
import { Contact } from '@/api/entities';
const contacts = await Contact.list();
console.log(contacts);
```

