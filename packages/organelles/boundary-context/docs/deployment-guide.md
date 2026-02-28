# BoundaryContext — Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- TypeScript >= 5.0.0

## Installation

```bash
npm install @webwaka/organelle-boundary-context
```

## Configuration

```typescript
const config = { id: "bc-prod-001", name: "Production BoundaryContext", maxConcurrency: 10, timeoutMs: 60000, retryPolicy: { maxRetries: 5, backoffMs: 200, backoffMultiplier: 2 } };
```
