# Development Environment Setup

**Module:** Minimal Kernel (Module 1)  
**Repository:** `webwaka-platform`  
**Date:** 2026-02-09  
**Author:** webwakaagent4 (Engineering)

---

## 1. Overview

This document provides instructions for setting up the local development environment for the WebWaka Platform Core, starting with the Minimal Kernel.

## 2. Prerequisites

- **Node.js:** v18.x or later
- **pnpm:** v8.x or later
- **Docker:** Latest version
- **Git:** Latest version

## 3. Local Setup

### 3.1 Clone the Repository

```bash
git clone https://github.com/WebWakaHub/webwaka-platform.git
cd webwaka-platform
```

### 3.2 Install Dependencies

Install all project dependencies using `pnpm`:

```bash
pnpm install
```

### 3.3 Configure Environment Variables

Create a `.env` file in the root of the project and add the following variables:

```
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=webwaka

# NATS
NATS_URL=nats://localhost:4222

# Redis
REDIS_URL=redis://localhost:6379
```

### 3.4 Start Local Services (Docker)

A `docker-compose.yml` file is provided to easily start the required services (PostgreSQL, NATS, Redis).

```bash
docker-compose up -d
```

## 4. Development Workflow

### 4.1 Running in Development Mode

To start the application in development mode with hot-reloading:

```bash
pnpm dev
```

### 4.2 Building for Production

To build the application for production:

```bash
pnpm build
```

### 4.3 Running Tests

To run all tests and generate a coverage report:

```bash
pnpm test
```

To run tests in watch mode:

```bash
pnpm test:watch
```

### 4.4 Linting and Formatting

To lint the codebase:

```bash
pnpm lint
```

To format the codebase:

```bash
pnpm format
```

## 5. CI/CD Pipeline

The CI/CD pipeline is configured using GitHub Actions and is located at `.github/workflows/ci.yml`. The pipeline is triggered on every push and pull request to the `master` branch and performs the following steps:

1. **Install Dependencies:** Installs all project dependencies using `pnpm`.
2. **Lint:** Lints the codebase to ensure code quality.
3. **Build:** Builds the application for production.
4. **Test:** Runs all tests and generates a coverage report.


## 6. Project Structure

```
webwaka-platform/
├── src/
│   ├── kernel/
│   │   ├── api-gateway/       # API Gateway component
│   │   ├── event-bus/         # Event Bus component
│   │   ├── plugin-manager/    # Plugin Manager component
│   │   ├── tenant-manager/    # Tenant Manager component
│   │   └── permission-manager/ # Permission Manager component
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   └── __tests__/             # Test files
├── dist/                      # Compiled output (generated)
├── coverage/                  # Test coverage reports (generated)
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD pipeline
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest test configuration
└── DEV_ENVIRONMENT_SETUP.md   # This file
```

## 7. Testing Requirements

The Minimal Kernel requires **100% unit test coverage** (non-negotiable). All code must be thoroughly tested before being merged to the `master` branch.

### 7.1 Coverage Thresholds

The Jest configuration enforces the following coverage thresholds:

- **Branches:** 100%
- **Functions:** 100%
- **Lines:** 100%
- **Statements:** 100%

Any pull request that does not meet these thresholds will fail the CI/CD pipeline.

## 8. Code Quality Standards

- **TypeScript:** All code must be written in TypeScript with strict type checking enabled.
- **ESLint:** All code must pass ESLint checks with no errors or warnings.
- **Prettier:** All code must be formatted using Prettier.
- **Naming Conventions:** Use camelCase for variables and functions, PascalCase for classes and types.

## 9. Troubleshooting

### 9.1 Docker Services Not Starting

If Docker services fail to start, ensure Docker is running and you have sufficient system resources. Check the logs:

```bash
docker-compose logs
```

### 9.2 Test Coverage Below 100%

If test coverage is below 100%, identify untested code using the coverage report:

```bash
pnpm test
open coverage/lcov-report/index.html
```

## 10. Next Steps

Once the development environment is set up, you can begin implementing the Minimal Kernel components as specified in the `MINIMAL_KERNEL_SPECIFICATION.md` (v1.0).

---

**Document Status:** ACTIVE  
**Created By:** webwakaagent4 (Engineering)  
**Date:** 2026-02-09  
**Last Updated:** 2026-02-09
