# WebWaka Platform Monorepo

WebWaka is a biological-architecture Platform for building Platforms. This monorepo consolidates all biological layer components, applications, and infrastructure into a single Nx-managed workspace.

## Biological Hierarchy

The codebase follows a strict 6-layer biological hierarchy. Each layer can only depend on layers below it.

| Layer | Directory | Description |
|-------|-----------|-------------|
| **Organism** | `packages/organism/` | Central event bus, platform-wide orchestration |
| **Systems** | `packages/systems/` | Business domain suites (Commerce, Transport, etc.) |
| **Organs** | `packages/organs/` | Functional units (Authentication, Payment, etc.) |
| **Tissues** | `packages/tissues/` | Composed cell groups (User Management, etc.) |
| **Cells** | `packages/cells/` | Single-responsibility units (Validator, Logger, etc.) |
| **Organelles** | `packages/organelles/` | Atomic building blocks (Event Emitter, Queue, etc.) |

## Applications

| App | Directory | Description |
|-----|-----------|-------------|
| **Super Admin Dashboard** | `apps/super-admin-dashboard/` | Platform management UI (React + Vite) |
| **Identity Service** | `apps/identity-service/` | Authentication and authorization (NestJS) |
| **Tenancy Service** | `apps/tenancy-service/` | Multi-tenant management (NestJS) |
| **Billing Service** | `apps/billing-service/` | Payments and subscriptions (NestJS) |
| **Notification Service** | `apps/notification-service/` | SMS, Email, Push notifications (NestJS) |

## Infrastructure

| Component | Directory | Description |
|-----------|-----------|-------------|
| **AWS** | `infra/aws/` | Terraform for VPC, ECS, RDS, EventBridge |
| **Cloudflare** | `infra/cloudflare/` | DNS, R2, Pages, Workers configuration |

## Getting Started

```bash
# Install dependencies
pnpm install

# View the dependency graph
npx nx graph

# Build all packages
npx nx run-many -t build

# Test all packages
npx nx run-many -t test

# Lint all packages
npx nx run-many -t lint
```

## Dependency Rules

The following cross-layer import rules are enforced by the Governance CI:

1. Organelles depend on nothing (leaf nodes).
2. Cells may depend on Organelles only.
3. Tissues may depend on Cells and Organelles.
4. Organs may depend on Tissues, Cells, and Organelles.
5. Systems may depend on Organs, Tissues, Cells, and Organelles.
6. Organism may depend on Systems and all layers below.
7. Apps may depend on any package layer.
8. No circular dependencies are permitted.

## Constitutional Invariants

Every pull request is checked against 12 non-negotiable architectural invariants. See `.github/workflows/governance.yml` for details.
