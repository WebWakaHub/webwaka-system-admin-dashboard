# Test Environment Setup

**Module:** Minimal Kernel (Module 1)  
**Repository:** `webwaka-platform`  
**Date:** 2026-02-09  
**Author:** webwakaagent5 (Quality)

---

## 1. Overview

This document provides instructions for setting up and using the test environment for the WebWaka Platform Core. The test environment is designed to support unit, integration, end-to-end (E2E), performance, and security testing.

## 2. Test Infrastructure

The test infrastructure is managed using Docker and Docker Compose. A `docker-compose.test.yml` file is provided to create an isolated environment for testing, with separate services for the database, event bus, and cache.

### 2.1 Services

- **PostgreSQL:** Test database running on port `5433`.
- **NATS:** Test event bus running on port `4223`.
- **Redis:** Test cache running on port `6380`.

### 2.2 Starting the Test Environment

To start all test services:

```bash
pnpm test:env:up
```

### 2.3 Stopping the Test Environment

To stop all test services:

```bash
pnpm test:env:down
```

To stop and remove all data volumes:

```bash
pnpm test:env:clean
```

## 3. Test Frameworks

- **Jest:** Primary framework for unit, integration, and E2E testing.
- **Supertest:** For HTTP assertions in integration and E2E tests.
- **Testcontainers:** For managing Docker containers programmatically in tests.

## 4. Test Data

Test data is located in `test/fixtures/test-data.ts` and includes mock data for:

- Tenants
- Users
- Roles and permissions

This data is used to ensure consistent and repeatable test results.

## 5. Running Tests

### 5.1 All Tests

To run all tests and generate a coverage report:

```bash
pnpm test
```

### 5.2 Unit Tests

To run only unit tests:

```bash
pnpm test:unit
```

### 5.3 Integration Tests

To run only integration tests:

```bash
pnpm test:integration
```

### 5.4 End-to-End Tests

To run only E2E tests:

```bash
pnpm test:e2e
```

## 6. Test Automation Pipeline

The CI/CD pipeline in `.github/workflows/ci.yml` is configured to run all tests on every push and pull request to the `master` branch. The pipeline will fail if:

- Any test fails.
- Code coverage is below 100%.

## 7. Performance and Security Testing

- **Performance Testing:** Tools like k6 will be used to script and execute load tests against the running application. These scripts are located in `test/performance/`.
- **Security Testing:** Tools like OWASP ZAP and Snyk will be used to scan for vulnerabilities. These tests are run manually at this stage and will be automated in a later phase.

---

**Document Status:** ACTIVE  
**Created By:** webwakaagent5 (Quality)  
**Date:** 2026-02-09  
**Last Updated:** 2026-02-09
