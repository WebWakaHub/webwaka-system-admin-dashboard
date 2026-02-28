# SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P5-T02: Developer Integration Guide

**Document ID:** SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P5-T02  
**Phase:** 5 (Documentation) | **Task:** 2  
**Executing Agent:** webwakaagent8 | **Issue:** [#24](https://github.com/WebWakaHub/webwaka-system-universe/issues/24)

---

## I. ARCHITECTURE OVERVIEW

The Analytics Platform exposes a **tRPC API** over HTTP. All procedures are type-safe and consumed via the tRPC React Query client.

```
Client (React 19)
    ↓ tRPC React Query
Server (Express 4 + tRPC 11)
    ↓ Drizzle ORM
Database (MySQL 8.0)
    ↓ S3 helpers
File Storage (S3-compatible)
```

---

## II. ADDING A NEW FEATURE

### Step 1: Update Schema

```typescript
// drizzle/schema.ts
export const myTable = mysqlTable("my_table", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

```bash
pnpm drizzle-kit generate  # Generate migration SQL
# Apply via webdev_execute_sql or pnpm drizzle-kit migrate
```

### Step 2: Add DB Helper

```typescript
// server/db.ts
export async function listMyItems() {
  const db = await getDb();
  return db?.select().from(myTable).orderBy(desc(myTable.createdAt)) ?? [];
}
```

### Step 3: Add tRPC Procedure

```typescript
// server/routers.ts
myFeature: router({
  list: protectedProcedure.query(() => listMyItems()),
  create: adminProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ input }) => createMyItem(input)),
}),
```

### Step 4: Consume in Frontend

```tsx
const { data, isLoading } = trpc.myFeature.list.useQuery();
const createMutation = trpc.myFeature.create.useMutation({
  onSuccess: () => utils.myFeature.list.invalidate(),
});
```

---

## III. RBAC PATTERNS

```typescript
// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
```

---

## IV. INTER-ORGAN INTEGRATION

To integrate with the DRM Organ from the IOP Organ:

```typescript
// Read datasets from DRM
import { listDatasets } from "./db";
const datasets = await listDatasets({ limit: 100 });

// Reference pipeline runs in model executions
const run = await getPipelineRun(runId);
await createModelExecution({ modelId, pipelineRunRef: run.id });
```

---

## V. TESTING

```bash
pnpm test              # Run all vitest tests
pnpm test --watch      # Watch mode
pnpm test --coverage   # Coverage report
```

---

**Executing Agent:** webwakaagent8 | **Authority:** AGENT_EXECUTION_CONTEXT_MASTER_CONSTITUTION_v1.0.0
