# [ORG-IA-SUBJECT_REGISTRY-v0.1.0-P5-T02] Create Usage Examples

**Issue:** #24
**Phase:** 5 — Documentation
**Agent:** webwakaagent4 (Engineering & Delivery)
**Execution Date:** 2026-02-26

---

## 1. Setup and Dependency Injection

```typescript
import {
  SubjectRegistry,
  SubjectType,
  SubjectStatus,
  ISubjectStorage,
  ISubjectEventEmitter,
  ISubjectObservability,
} from '@webwaka/organelle-subject-registry';

// Cell layer provides concrete implementations
const storage: ISubjectStorage = createStorageAdapter();
const events: ISubjectEventEmitter = createEventBus();
const observability: ISubjectObservability = createObservabilityProvider();

const registry = new SubjectRegistry(storage, events, observability);
```

## 2. Register a New Subject

```typescript
const subject = await registry.registerSubject({
  subject_type: SubjectType.USER,
  attributes: {
    display_name: 'Alice',
    locale: 'en-US',
    active_sessions: 0,
  },
  requesting_context: {
    source_system: 'user-onboarding-service',
    timestamp: new Date().toISOString(),
  },
});

console.log(subject.subject_id);   // "a1b2c3d4-..."
console.log(subject.status);       // "ACTIVE"
console.log(subject.version);      // 1
```

## 3. Register a Service Account

```typescript
const serviceAccount = await registry.registerSubject({
  subject_type: SubjectType.SERVICE_ACCOUNT,
  attributes: {
    service_name: 'payment-processor',
    environment: 'production',
  },
  requesting_context: {
    source_system: 'infrastructure-provisioner',
    timestamp: new Date().toISOString(),
  },
  idempotency_key: 'provision-payment-processor-v2',
});
```

## 4. Suspend a Subject

```typescript
const suspended = await registry.updateSubjectStatus({
  subject_id: subject.subject_id,
  new_status: SubjectStatus.SUSPENDED,
  reason: 'Suspicious activity detected by fraud engine',
  expected_version: subject.version,
  requesting_context: {
    source_system: 'fraud-detection-service',
    timestamp: new Date().toISOString(),
  },
});

console.log(suspended.status);   // "SUSPENDED"
console.log(suspended.version);  // 2
```

## 5. Reactivate a Suspended Subject

```typescript
const reactivated = await registry.updateSubjectStatus({
  subject_id: suspended.subject_id,
  new_status: SubjectStatus.ACTIVE,
  reason: 'Investigation cleared — false positive',
  expected_version: suspended.version,
  requesting_context: {
    source_system: 'support-dashboard',
    timestamp: new Date().toISOString(),
  },
});
```

## 6. Archive a Subject (Terminal)

```typescript
const archived = await registry.updateSubjectStatus({
  subject_id: subject.subject_id,
  new_status: SubjectStatus.ARCHIVED,
  reason: 'Account closed by user request',
  expected_version: reactivated.version,
  requesting_context: {
    source_system: 'account-management-service',
    timestamp: new Date().toISOString(),
  },
});

// Terminal state — no further mutations allowed
```

## 7. Update Subject Attributes

```typescript
const updated = await registry.updateSubjectAttributes({
  subject_id: subject.subject_id,
  attributes: {
    display_name: 'Alice Smith',
    locale: 'en-GB',
    active_sessions: 3,
  },
  expected_version: subject.version,
  requesting_context: {
    source_system: 'profile-service',
    timestamp: new Date().toISOString(),
  },
});
```

## 8. Look Up a Subject

```typescript
const record = await registry.getSubject({
  subject_id: 'a1b2c3d4-...',
});

console.log(record.subject_type);  // "USER"
console.log(record.attributes);    // { display_name: "Alice", ... }
```

## 9. Error Handling

```typescript
import { SubjectRegistryError, SubjectRegistryErrorCode } from '@webwaka/organelle-subject-registry';

try {
  await registry.updateSubjectStatus({
    subject_id: archived.subject_id,
    new_status: SubjectStatus.ACTIVE,
    expected_version: archived.version,
    requesting_context: {
      source_system: 'admin-tool',
      timestamp: new Date().toISOString(),
    },
  });
} catch (error) {
  if (error instanceof SubjectRegistryError) {
    switch (error.code) {
      case SubjectRegistryErrorCode.TERMINAL_STATE_MUTATION:
        console.error('Cannot modify archived subject');
        break;
      case SubjectRegistryErrorCode.CONCURRENT_MODIFICATION_CONFLICT:
        console.error('Retry with latest version');
        break;
      case SubjectRegistryErrorCode.SUBJECT_NOT_FOUND:
        console.error('Subject does not exist');
        break;
    }
  }
}
```

## 10. Optimistic Concurrency Retry Pattern

```typescript
async function safeUpdateStatus(
  registry: ISubjectRegistry,
  subjectId: string,
  newStatus: SubjectStatus,
  reason: string,
  maxRetries = 3
): Promise<SubjectRecord> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const current = await registry.getSubject({ subject_id: subjectId });
    try {
      return await registry.updateSubjectStatus({
        subject_id: subjectId,
        new_status: newStatus,
        reason,
        expected_version: current.version,
        requesting_context: {
          source_system: 'retry-aware-service',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (
        error instanceof SubjectRegistryError &&
        error.code === SubjectRegistryErrorCode.CONCURRENT_MODIFICATION_CONFLICT &&
        attempt < maxRetries - 1
      ) {
        continue; // Retry with fresh version
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Unblocks:** #25

---

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
