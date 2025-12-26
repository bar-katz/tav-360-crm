# TAV 360 CRM E2E Test Suite

Comprehensive End-to-End (E2E) test suite for TAV 360 CRM, focusing on business-critical flows that impact revenue, trust, and data integrity.

## Architecture Overview

### Test Strategy

- **E2E Tests**: Business-critical flows (revenue, trust, data integrity)
- **API Tests**: CRUD operations, validation, permissions (separate suite)
- **Test Isolation**: Fresh database instance per test run
- **Auth Optimization**: JWT token generated once per suite, reused across tests
- **Observability**: Structured logging, screenshots on failure, execution metrics

### Test Framework Stack

- **E2E**: Playwright (TypeScript)
- **Database**: PostgreSQL test instance with migrations
- **Docker**: Test containers for isolation
- **CI/CD**: GitHub Actions / GitLab CI ready

## Directory Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── fixtures/                 # Test fixtures and utilities
│   │   ├── auth.ts               # Auth token generation (once per suite)
│   │   ├── database.ts           # DB setup/teardown, isolation
│   │   ├── api-client.ts         # API client helpers
│   │   ├── test-data.ts          # Test data factories
│   │   └── observability.ts      # Logging and metrics
│   ├── business-critical/        # Revenue/trust/data integrity tests
│   │   ├── matching.spec.ts      # Property-client matching
│   │   ├── tenant-revenue.spec.ts # Lease management & revenue
│   │   ├── work-orders.spec.ts   # Cost tracking
│   │   ├── accounting.spec.ts    # Financial document integrity
│   │   ├── compliance.spec.ts    # Do Not Call List
│   │   ├── marketing-compliance.spec.ts # WhatsApp compliance
│   │   └── upload.spec.ts        # File uploads
│   ├── integration/              # Cross-module workflows
│   │   ├── property-lifecycle.spec.ts
│   │   └── client-journey.spec.ts
│   └── config/
│       ├── playwright.config.ts  # Playwright configuration
│       └── test-env.ts           # Environment variables
├── api/                          # API tests (CRUD, validation)
└── utils/                        # Shared utilities
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (for test database)
- Docker (optional, for containerized testing)
- **Backend API running** (default: http://localhost:8000)
  - Backend must be configured to use the test database
  - Set `DATABASE_URL` environment variable to point to test database
  - Or use the same database as tests (see Configuration section)
- Frontend running (default: http://localhost:3000)

**Important:** The backend API must be running and configured to use the same database that tests are using. The test suite creates a test database, but the backend needs to be configured to connect to it.

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (Chromium only - sufficient for most tests)
npm run install:browsers

# Or install all browsers with system dependencies (requires sudo)
npm run install:browsers:all
```

**Note:** If browser installation fails with sudo password prompt, use `npm run install:browsers` which installs browsers without system dependencies. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details.

## Configuration

### Environment Variables

Create a `.env` file in the `tests/` directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Test Database Configuration
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USER=tav360
TEST_DB_PASSWORD=tav360secret
TEST_DB_NAME_PREFIX=tav360_test

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
TEST_USER_ROLE=admin

# Test Execution Settings
TEST_TIMEOUT=60000
SCREENSHOT_ON_FAILURE=true
HEADLESS=true
```

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Specific Test Suite

```bash
# Business-critical tests
npx playwright test tests/e2e/business-critical

# Integration tests
npx playwright test tests/e2e/integration

# Specific test file
npx playwright test tests/e2e/business-critical/matching.spec.ts
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

## Test Execution Flow

### Pre-Test Setup (Once Per Suite)

1. Start test database container (if using Docker)
2. Create unique test database (`tav360_test_<timestamp>`)
3. Run migrations on fresh DB
4. Seed base data (admin user, roles)
5. Generate auth token (store in shared context)
6. Initialize test data factories

### Per-Test Setup

1. Start transaction (if supported)
2. Create test-specific data
3. Set up test state

### Per-Test Teardown

1. Rollback transaction OR clean test data
2. Capture screenshots on failure
3. Log test execution time

### Post-Suite Teardown

1. Drop test database
2. Stop containers
3. Generate test report

## Test Data Management

### Test Data Factories

Use factory functions from `fixtures/test-data.ts`:

```typescript
import { createContact, createProperty, createClient } from '../fixtures/test-data';

const contact = await createContact(apiContext);
const property = await createProperty(apiContext, { contact_id: contact });
const client = await createClient(apiContext, { budget: 1000000 });
```

### Database Isolation

- Each test run gets a fresh database
- Database name: `tav360_test_<timestamp>`
- Automatic cleanup after suite completion
- Never share database state between tests

## Observability

### Test Logs

Test logs are saved to `test-results/logs/`:

```json
{
  "test_id": "E2E_MATCH_001",
  "test_name": "E2E_MATCH_001",
  "logs": [
    {
      "test_id": "E2E_MATCH_001",
      "timestamp": "2025-01-20T10:30:00Z",
      "step": "generate_matches",
      "action": "click_button",
      "duration_ms": 150
    }
  ],
  "metrics": {
    "total_steps": 5,
    "total_duration_ms": 2500,
    "api_calls": 3,
    "db_queries": 2,
    "errors": 0
  }
}
```

### Screenshots

Screenshots on failure are saved to `test-results/screenshots/`

### Database Snapshots

Database state snapshots on failure are saved to `test-results/db-snapshots/`

## Guidelines for QA Engineers

### When to Create E2E Tests

✅ **Create E2E test if:**
- Feature impacts revenue (matching, leases, payments)
- Feature impacts trust (compliance, data privacy)
- Feature impacts data integrity (financial records, relationships)
- Feature involves complex multi-step workflows across modules
- Feature has business logic that must be verified end-to-end

❌ **Use API tests instead if:**
- Simple CRUD operations
- Input validation rules
- Permission checks
- List/filter operations
- Single-module operations

### Test Case Naming Convention

- Format: `E2E_<MODULE>_<NUMBER>`
- Modules: MATCH, TENANT, WO (Work Order), ACCT (Accounting), DNC (Do Not Call), MKTG (Marketing), UPLOAD, INTEG (Integration)
- Example: `E2E_MATCH_001`, `E2E_TENANT_002`

### Best Practices

1. **Database Assertions**: Always verify database state, not just UI
2. **Test Isolation**: Never depend on other tests
3. **Realistic Data**: Use factories for realistic but anonymized data
4. **Error Handling**: Capture screenshots and logs on failure
5. **Performance**: Use transactions where possible for speed

## Troubleshooting

### Database Connection Issues

```bash
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432

# Check test database exists
psql -h localhost -U tav360 -l | grep tav360_test
```

### Auth Token Issues

- Verify test user exists in database
- Check JWT_SECRET matches backend configuration
- Verify backend API is running

### Test Failures

1. Check `test-results/` directory for screenshots and logs
2. Review database snapshots in `test-results/db-snapshots/`
3. Check network logs in Playwright trace viewer
4. Verify backend API logs

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: tav360
          POSTGRES_PASSWORD: tav360secret
          POSTGRES_DB: tav360_crm
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [E2E Test Cases](./E2E_TEST_CASES.md) - Detailed test case documentation
- [Test Architecture](./docs/test-architecture.md) - Detailed architecture documentation

