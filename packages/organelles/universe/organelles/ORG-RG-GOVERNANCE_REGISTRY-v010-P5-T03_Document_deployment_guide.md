# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P5-T03: Deployment Guide

## Prerequisites
- Node.js >= 18.0.0, PostgreSQL >= 14.0

## Database Setup
```sql
-- See P3-T02 for full schema
CREATE TABLE governance_rules (...);
CREATE TABLE rule_versions (...);
CREATE TABLE compliance_bindings (...);
```

## Installation
```bash
npm install @webwaka/organelle-governance-registry
```

## Configuration
```typescript
import { GovernanceOrchestrator } from '@webwaka/organelle-governance-registry';
const orchestrator = new GovernanceOrchestrator(storage, events, observability);
```
