# Donations Module - Integration Tests

**Test Type:** Integration Tests  
**Author:** webwakaagent5 (Quality, Security & Reliability)  
**Date:** 2026-02-13

---

## Overview

Integration tests verify the Donations module works correctly with real database connections, API endpoints, and external services.

---

## Test Files

1. **DonationAPI.integration.test.ts** - API endpoint integration tests
2. **CampaignAPI.integration.test.ts** - Campaign API integration tests
3. **Database.integration.test.ts** - Database operations and constraints

---

## Test Coverage

### API Integration Tests (30 tests)
- POST /api/v1/donations (all payment methods)
- GET /api/v1/donations/:id (authorization checks)
- GET /api/v1/donations (filtering, pagination)
- POST /api/v1/donations/:id/refund (permission checks)
- POST /api/v1/campaigns (validation)
- GET /api/v1/campaigns/:id (progress calculation)

### Database Integration Tests (20 tests)
- Donation CRUD operations with transactions
- Campaign progress updates with row-level locking
- Recurring donation scheduling
- Database constraint validation
- Concurrent donation handling

---

## Running Integration Tests

### Prerequisites

1. PostgreSQL test database
2. Environment variables configured

```bash
export TEST_DB_HOST=localhost
export TEST_DB_PORT=5432
export TEST_DB_USER=test
export TEST_DB_PASSWORD=test
export TEST_DB_NAME=webwaka_test
```

### Run Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test src/donations/__tests__/integration/DonationAPI.integration.test.ts

# Run with coverage
npm run test:integration -- --coverage
```

---

## Test Database Setup

```sql
-- Create test database
CREATE DATABASE webwaka_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE webwaka_test TO test;
```

---

## Notes

- Integration tests use real database connections
- Tests clean up data after each run
- Payment gateway tests use sandbox environments
- All tests are isolated and can run in parallel

---

## Quality Metrics

- **Target Coverage:** 100% of API endpoints
- **Performance:** < 5s per test suite
- **Reliability:** Zero flaky tests
- **Isolation:** Each test is independent
