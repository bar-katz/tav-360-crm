# E2E Test Cases Documentation

Comprehensive documentation of all E2E test cases for TAV 360 CRM.

## Test Case Index

### Module 1: Property-Client Matching (Revenue Impact)
- [E2E_MATCH_001](#e2e_match_001)
- [E2E_MATCH_002](#e2e_match_002)
- [E2E_MATCH_003](#e2e_match_003)

### Module 2: Tenant & Lease Management (Revenue)
- [E2E_TENANT_001](#e2e_tenant_001)
- [E2E_TENANT_002](#e2e_tenant_002)
- [E2E_TENANT_003](#e2e_tenant_003)

### Module 3: Work Orders & Cost Tracking (Financial)
- [E2E_WO_001](#e2e_wo_001)
- [E2E_WO_002](#e2e_wo_002)

### Module 4: Accounting Documents (Financial Integrity)
- [E2E_ACCT_001](#e2e_acct_001)
- [E2E_ACCT_002](#e2e_acct_002)

### Module 5: Do Not Call List (Compliance)
- [E2E_DNC_001](#e2e_dnc_001)
- [E2E_DNC_002](#e2e_dnc_002)
- [E2E_DNC_003](#e2e_dnc_003)

### Module 6: Marketing & WhatsApp (Compliance + Trust)
- [E2E_MKTG_001](#e2e_mktg_001)
- [E2E_MKTG_002](#e2e_mktg_002)
- [E2E_MKTG_003](#e2e_mktg_003)

### Module 7: File Uploads (Data Integrity)
- [E2E_UPLOAD_001](#e2e_upload_001)
- [E2E_UPLOAD_002](#e2e_upload_002)
- [E2E_UPLOAD_003](#e2e_upload_003)

### Module 8: Cross-Module Integration
- [E2E_INTEG_001](#e2e_integ_001)
- [E2E_INTEG_002](#e2e_integ_002)

---

## Module 1: Property-Client Matching

### E2E_MATCH_001

**Title:** Verify automatic match generation creates valid matches

**Priority:** P0 (Critical - Revenue Impact)

**Preconditions:**
- Test DB with 5 properties and 3 clients
- Properties have varied attributes (price, type, area, rooms)
- Clients have varied preferences (budget, property_type, area, rooms)

**Test Steps:**
1. Navigate to Brokerage Dashboard
2. Click "Generate Matches" button
3. Verify matches are created with scores >= 60
4. Verify match scores are calculated correctly (area=20, rooms=20, type=25, transaction=15, budget=20)
5. Verify no duplicate matches created
6. Verify matches link correct property_id and client_id

**Expected Result:**
- Matches created with valid scores
- Database contains match records with correct foreign keys
- Match scores reflect actual compatibility

**Test File:** `tests/e2e/business-critical/matching.spec.ts`

---

### E2E_MATCH_002

**Title:** Verify match generation respects existing matches (no duplicates)

**Priority:** P0

**Preconditions:**
- Existing matches in database
- New properties/clients added

**Test Steps:**
1. Record existing match count
2. Generate matches
3. Verify no duplicate matches created (same property_id + client_id combination)

**Expected Result:** Only new matches created, no duplicates

**Test File:** `tests/e2e/business-critical/matching.spec.ts`

---

### E2E_MATCH_003

**Title:** Verify match score calculation accuracy

**Priority:** P1

**Preconditions:** Known property and client with specific attributes

**Test Steps:**
1. Create property: price=1M, type="דירה", area="תל אביב", rooms=3
2. Create client: budget=1.1M, preferred_type="דירה", desired_area="תל אביב", desired_rooms=3
3. Generate matches
4. Verify match score = 100 (all criteria match)

**Expected Result:** Match score accurately reflects compatibility

**Test File:** `tests/e2e/business-critical/matching.spec.ts`

---

## Module 2: Tenant & Lease Management

### E2E_TENANT_001

**Title:** Verify tenant creation with lease dates and rent calculation

**Priority:** P0 (Revenue - lease tracking)

**Preconditions:**
- Property exists
- Contact exists

**Test Steps:**
1. Navigate to Tenants page
2. Create new tenant with lease_start_date, lease_end_date, monthly_rent
3. Save tenant record
4. Verify tenant record persisted with correct dates and rent
5. Verify property_id and contact_id foreign keys are set

**Expected Result:**
- Tenant record created with all fields
- Foreign key relationships intact
- Dates stored correctly

**Test File:** `tests/e2e/business-critical/tenant-revenue.spec.ts`

---

### E2E_TENANT_002

**Title:** Verify lease date validation (end_date > start_date)

**Priority:** P1

**Preconditions:** Property and contact exist

**Test Steps:**
1. Attempt to create tenant with lease_end_date < lease_start_date
2. Verify validation error displayed
3. Verify no tenant record created in database

**Expected Result:** Validation prevents invalid lease dates

**Test File:** `tests/e2e/business-critical/tenant-revenue.spec.ts`

---

### E2E_TENANT_003

**Title:** Verify tenant-property relationship integrity

**Priority:** P0 (Data Integrity)

**Preconditions:** Property with existing tenant

**Test Steps:**
1. Create tenant linked to property
2. Verify property can be queried with tenant relationship
3. Delete property (if cascade) or verify constraint prevents deletion

**Expected Result:** Referential integrity maintained

**Test File:** `tests/e2e/business-critical/tenant-revenue.spec.ts`

---

## Module 3: Work Orders & Cost Tracking

### E2E_WO_001

**Title:** Verify work order creation with cost tracking

**Priority:** P0 (Financial - expense tracking)

**Preconditions:**
- Property exists
- Supplier exists
- Contact exists

**Test Steps:**
1. Navigate to Work Orders
2. Create work order with property_id, supplier_id, contact_id, cost
3. Save work order
4. Verify work order persisted with correct cost
5. Verify all foreign keys set correctly

**Expected Result:**
- Work order created with accurate cost
- Foreign keys maintain referential integrity

**Test File:** `tests/e2e/business-critical/work-orders.spec.ts`

---

### E2E_WO_002

**Title:** Verify work order cost aggregation per property

**Priority:** P1

**Preconditions:** Multiple work orders for same property

**Test Steps:**
1. Create 3 work orders for property A with costs: 1000, 2000, 1500
2. Query total cost for property A
3. Verify total = 4500

**Expected Result:** Cost calculations accurate

**Test File:** `tests/e2e/business-critical/work-orders.spec.ts`

---

## Module 4: Accounting Documents

### E2E_ACCT_001

**Title:** Verify accounting document creation with file attachment

**Priority:** P0 (Financial Integrity)

**Preconditions:**
- Property and contact exist
- Test PDF file available

**Test Steps:**
1. Navigate to Accounting Documents
2. Create document with type, number, amount, date
3. Upload file attachment
4. Link to property and contact
5. Save document
6. Verify document persisted with file_url
7. Verify file accessible at file_url
8. Verify amount stored with correct precision (2 decimals)

**Expected Result:**
- Document created with all fields
- File uploaded and accessible
- Amount precision maintained

**Test File:** `tests/e2e/business-critical/accounting.spec.ts`

---

### E2E_ACCT_002

**Title:** Verify accounting document amount precision (no rounding errors)

**Priority:** P0

**Preconditions:** Property and contact exist

**Test Steps:**
1. Create document with amount = 1234.56
2. Save and retrieve document
3. Verify amount = 1234.56 (exact match, no rounding)

**Expected Result:** Financial precision maintained

**Test File:** `tests/e2e/business-critical/accounting.spec.ts`

---

## Module 5: Do Not Call List

### E2E_DNC_001

**Title:** Verify Do Not Call List prevents WhatsApp sending

**Priority:** P0 (Legal Compliance)

**Preconditions:**
- Phone number in Do Not Call List
- Marketing lead with same phone number exists

**Test Steps:**
1. Attempt to send WhatsApp message to number in DNC list
2. Verify system prevents sending
3. Verify error message displayed
4. Verify no marketing_log entry created

**Expected Result:** Compliance enforced, no messages sent to DNC numbers

**Test File:** `tests/e2e/business-critical/compliance.spec.ts`

---

### E2E_DNC_002

**Title:** Verify Do Not Call List uniqueness constraint

**Priority:** P1

**Preconditions:** Phone number already in DNC list

**Test Steps:**
1. Attempt to add same phone number to DNC list again
2. Verify database constraint prevents duplicate
3. Verify error message displayed

**Expected Result:** Unique constraint enforced

**Test File:** `tests/e2e/business-critical/compliance.spec.ts`

---

### E2E_DNC_003

**Title:** Verify Do Not Call List check before bulk WhatsApp send

**Priority:** P0

**Preconditions:**
- 5 marketing leads
- 1 lead's phone in DNC list

**Test Steps:**
1. Select all 5 leads for bulk WhatsApp
2. Send bulk message
3. Verify only 4 messages sent (DNC number excluded)
4. Verify marketing_log shows 4 entries, not 5

**Expected Result:** DNC check applied to bulk operations

**Test File:** `tests/e2e/business-critical/compliance.spec.ts`

---

## Module 6: Marketing & WhatsApp

### E2E_MKTG_001

**Title:** Verify WhatsApp message logging for audit trail

**Priority:** P0 (Compliance - message history)

**Preconditions:** Marketing lead exists

**Test Steps:**
1. Send WhatsApp message to lead
2. Verify marketing_log entry created with:
   - lead_id
   - phone_number
   - message_sent (exact message text)
   - status = "sent"
   - sent_by = current_user.id
   - created_date timestamp
3. Verify log entry queryable and immutable

**Expected Result:** Complete audit trail maintained

**Test File:** `tests/e2e/business-critical/marketing-compliance.spec.ts`

---

### E2E_MKTG_002

**Title:** Verify bulk WhatsApp respects opt-out preferences

**Priority:** P0

**Preconditions:**
- 3 marketing leads
- 1 lead has opt_out_whatsapp = true

**Test Steps:**
1. Select all 3 leads for bulk send
2. Send bulk message
3. Verify only 2 messages sent (opt-out excluded)
4. Verify marketing_log shows 2 entries

**Expected Result:** User preferences respected

**Test File:** `tests/e2e/business-critical/marketing-compliance.spec.ts`

---

### E2E_MKTG_003

**Title:** Verify WhatsApp message template personalization

**Priority:** P1

**Preconditions:** Marketing lead with first_name, last_name, neighborhood, budget

**Test Steps:**
1. Send bulk message with template containing {first_name}, {last_name}, {neighborhood}, {budget}
2. Verify message personalized correctly
3. Verify marketing_log contains personalized message

**Expected Result:** Template variables replaced correctly

**Test File:** `tests/e2e/business-critical/marketing-compliance.spec.ts`

---

## Module 7: File Uploads

### E2E_UPLOAD_001

**Title:** Verify file upload creates accessible file

**Priority:** P0 (Data Integrity)

**Preconditions:** Test PDF file (5MB)

**Test Steps:**
1. Upload file via API
2. Verify file_url returned
3. Verify file accessible at file_url
4. Verify file content matches original
5. Verify file stored with UUID filename (not original name)

**Expected Result:**
- File uploaded and accessible
- Content integrity maintained
- Security (UUID filename)

**Test File:** `tests/e2e/business-critical/upload.spec.ts`

---

### E2E_UPLOAD_002

**Title:** Verify file upload size validation

**Priority:** P1

**Preconditions:** Test file > 10MB

**Test Steps:**
1. Attempt to upload file > 10MB
2. Verify error returned (400)
3. Verify file not stored

**Expected Result:** Size limit enforced

**Test File:** `tests/e2e/business-critical/upload.spec.ts`

---

### E2E_UPLOAD_003

**Title:** Verify file upload type validation

**Priority:** P1

**Preconditions:** Test file with disallowed extension (.exe)

**Test Steps:**
1. Attempt to upload .exe file
2. Verify error returned
3. Verify file not stored

**Expected Result:** File type validation enforced

**Test File:** `tests/e2e/business-critical/upload.spec.ts`

---

## Module 8: Cross-Module Integration

### E2E_INTEG_001

**Title:** Verify property lifecycle: Create → Add Owner → Add Tenant → Create Work Order

**Priority:** P0

**Preconditions:** Contacts exist

**Test Steps:**
1. Create property
2. Add property owner (link contact to property)
3. Add tenant (link contact to property with lease)
4. Create work order for property
5. Verify all relationships intact:
   - Property → PropertyOwner
   - Property → Tenant
   - Property → WorkOrder
6. Query property with all relationships
7. Verify data consistency

**Expected Result:** Complete property lifecycle maintains data integrity

**Test File:** `tests/e2e/integration/property-lifecycle.spec.ts`

---

### E2E_INTEG_002

**Title:** Verify client journey: Create Client → Generate Match → Schedule Meeting → Create Task

**Priority:** P1

**Preconditions:** Properties exist

**Test Steps:**
1. Create client with preferences
2. Generate matches
3. Verify match created
4. Schedule meeting linked to client and matched property
5. Create task linked to client
6. Verify all relationships intact

**Expected Result:** Client journey maintains referential integrity

**Test File:** `tests/e2e/integration/client-journey.spec.ts`

---

## Test Execution Summary

### Total Test Cases: 20

**By Priority:**
- P0 (Critical): 14 tests
- P1 (High): 6 tests

**By Module:**
- Matching: 3 tests
- Tenant Management: 3 tests
- Work Orders: 2 tests
- Accounting: 2 tests
- Compliance: 3 tests
- Marketing: 3 tests
- File Uploads: 3 tests
- Integration: 2 tests

## Test Coverage

### Business-Critical Areas Covered

✅ **Revenue Impact:**
- Property-client matching algorithm
- Tenant lease management
- Work order cost tracking

✅ **Data Integrity:**
- Financial document precision
- File upload integrity
- Referential integrity across relationships

✅ **Compliance:**
- Do Not Call List enforcement
- WhatsApp message audit trails
- User opt-out preferences

✅ **Integration:**
- Cross-module workflows
- Data consistency across relationships

