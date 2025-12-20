# Feature 4: PostgreSQL Database Schema

**Status:** ✅ Complete  
**Branch:** `feature/database-schema`

## Description

Design and implement PostgreSQL database schema with migrations for all entities currently managed by Base44.

## Implementation

### Migration Files Created

1. `001_create_users.sql` - User authentication and roles
2. `002_create_contacts.sql` - Contact management
3. `003_create_properties.sql` - Property listings
4. `004_create_clients.sql` - Client/buyer management
5. `005_create_meetings.sql` - Calendar events
6. `006_create_tasks.sql` - Task management
7. `007_create_service_calls.sql` - Service tickets
8. `008_create_suppliers.sql` - Supplier management
9. `009_create_projects.sql` - Project management
10. `010_create_additional_tables.sql` - Additional entities
    - property_owners
    - tenants
    - matches
    - project_leads
    - marketing_leads
11. `011_create_marketing_logs.sql` - Marketing activity logs

### Key Tables

#### Users Table
- Authentication and role management
- Roles: admin, office_manager, agent, property_manager, project_manager
- Password hashing handled by backend

#### Contacts Table
- Central contact management
- Used by properties, clients, meetings, etc.
- Full name, phone, email, address, notes

#### Properties Table
- Property listings with categories (מגורים, משרדים)
- Property types (דירה, בית, etc.)
- Location, pricing, features
- Image URLs array support

#### Clients Table
- Buyers/renters with preferences
- Budget, preferred property type, rooms
- Opt-out flags for marketing

#### Meetings Table
- Calendar events
- Linked to contacts and properties
- Start/end dates, location, description

#### Tasks Table
- Task management with status and priority
- Due dates, assignments
- Linked to contacts and properties

#### Service Calls Table
- Support tickets
- Status tracking (open, in_progress, resolved, closed)
- Linked to properties, contacts, suppliers

#### Additional Tables
- **property_owners** - Property ownership relationships
- **tenants** - Tenant/lease management
- **matches** - Property-client matching
- **project_leads** - Project interest tracking
- **marketing_leads** - Marketing lead management
- **marketing_logs** - Marketing activity tracking

### Migration Script

Created `backend/scripts/migrate.py`:
- Reads migration files in order
- Executes SQL migrations
- Handles errors gracefully
- Can be run manually or via Docker

### Seed Data

Created `backend/seeds/development.sql`:
- Test users with different roles
- Sample contacts
- Ready for development testing

### Database Models

SQLAlchemy models created in `backend/src/models/`:
- User, Contact, Property, Client
- Meeting, Task, ServiceCall, Supplier, Project
- MarketingLead, MarketingLog

### Dependencies

- Feature 3 (Backend API Server) - Required for database connection

## Usage

### Running Migrations

```bash
# Set environment variable
export DATABASE_URL=postgresql://tav360:tav360secret@localhost:5432/tav360_crm

# Run migrations
python backend/scripts/migrate.py
```

### Via Docker

```bash
# Migrations run automatically on database initialization
# Or run manually:
docker-compose exec backend python scripts/migrate.py
```

### Manual SQL Execution

```bash
# Connect to database
docker-compose exec db psql -U tav360 -d tav360_crm

# Run migration files manually
\i /docker-entrypoint-initdb.d/001_create_users.sql
```

## Schema Features

- **Foreign Keys:** Proper relationships between tables
- **Indexes:** Created on frequently queried columns
- **Timestamps:** Created/updated dates on all tables
- **Constraints:** Check constraints for enums and statuses
- **Cascading:** Proper ON DELETE behavior

## Notes

- All tables use SERIAL primary keys
- Timestamps use `TIMESTAMP WITH TIME ZONE`
- Hebrew text supported via UTF-8 encoding
- Arrays supported for image URLs (PostgreSQL array type)
- Boolean fields use BOOLEAN type with defaults

## Next Steps

- Add indexes for performance optimization
- Consider partitioning for large tables
- Add database-level constraints for data integrity
- Implement soft deletes if needed

