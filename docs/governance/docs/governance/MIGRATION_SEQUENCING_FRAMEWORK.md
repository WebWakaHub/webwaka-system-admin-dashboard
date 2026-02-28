# MIGRATION SEQUENCING FRAMEWORK

**Document Type:** Migration Playbook  
**Authority:** Founder-Mandated  
**Status:** RATIFIED  
**Version:** 1.0  
**Date:** 2026-02-15

---

## 1. PURPOSE

This document defines the safe, deterministic sequencing for migrating capabilities from the monolith to the target architecture. It ensures zero downtime, backward compatibility, and rollback capability at every step.

**Migration is not refactoring. It is surgery on a running system.**

---

## 2. MIGRATION PRINCIPLES

1. **Dependency Untangling First:** Shared primitives before vertical logic
2. **Backward Compatibility Always:** Old and new must coexist during transition
3. **Dual-Write Phase:** Write to both old and new locations during migration
4. **Incremental Cutover:** Migrate consumers one at a time, not all at once
5. **Rollback Ready:** Every step must be reversible without data loss

---

## 3. DEPENDENCY UNTANGLING ORDER

### Phase 1: Platform Core (Weeks 1-4)

**Target:** Extract foundational infrastructure from monolith to `webwaka-platform-core`

**Sequence:**

1. **event-system** (Week 1)
   - Already canonical in `webwaka-modules-event-system`
   - Delete duplicate from `webwaka-platform/src/event-system`
   - Update all imports to use canonical version

2. **module-system** (Week 1)
   - Already canonical in `webwaka-modules-module-system`
   - Delete duplicate from `webwaka-platform/src/module-system`
   - Update all imports to use canonical version

3. **plugin-system** (Week 1)
   - Already canonical in `webwaka-modules-plugin-system`
   - Delete duplicate from `webwaka-platform/src/plugin-system`
   - Update all imports to use canonical version

4. **api-layer** (Week 2)
   - Extract from `webwaka-platform/src/modules/api-layer`
   - Move to `webwaka-platform-core/src/core/api-gateway`
   - Maintain adapter in old location for 1 release cycle

5. **sync-engine** (Week 2)
   - Extract from `webwaka-platform/src/modules/sync-engine`
   - Move to `webwaka-platform-core/src/core/sync`
   - Maintain adapter in old location for 1 release cycle

6. **weeg** (Week 3)
   - Extract from `webwaka-platform/src/modules/weeg`
   - Move to `webwaka-platform-core/src/core/permissions`
   - Maintain adapter in old location for 1 release cycle

7. **user-identity** (Week 3)
   - Extract from `webwaka-platform/src/user-identity`
   - Move to `webwaka-platform-core/src/core/identity`
   - Maintain adapter in old location for 1 release cycle

8. **audit-system** (Week 4)
   - Extract from `webwaka-platform/src/audit-system`
   - Move to `webwaka-platform-core/src/core/audit`
   - Maintain adapter in old location for 1 release cycle

**Dependencies:** None (these are foundational)

**Risk:** LOW (canonical versions already exist for event/module/plugin systems)

**Rollback:** Revert imports to old locations

---

### Phase 2: Platform Capabilities - Tier 1 (Weeks 5-8)

**Target:** Extract high-reuse, low-dependency capabilities

**Sequence:**

1. **economic-engine (MLAS)** (Week 5)
   - Extract from `webwaka-platform/src/economic-engine`
   - Move to `webwaka-platform-capabilities/src/mlas`
   - Create NPM package: `@webwaka/capability-mlas`
   - Publish v1.0.0

2. **payment-billing** (Week 5)
   - Extract from `webwaka-platform/src/payment-billing`
   - Move to `webwaka-platform-capabilities/src/payment`
   - Create NPM package: `@webwaka/capability-payment`
   - Publish v1.0.0

3. **communication-tools** (Week 6)
   - Extract from `webwaka-platform/src/communication-tools`
   - Move to `webwaka-platform-capabilities/src/communication`
   - Create NPM package: `@webwaka/capability-communication`
   - Publish v1.0.0

4. **search-discovery** (Week 6)
   - Extract from `webwaka-platform/src/search-discovery`
   - Move to `webwaka-platform-capabilities/src/search`
   - Create NPM package: `@webwaka/capability-search`
   - Publish v1.0.0

5. **analytics-reporting** (Week 7)
   - Extract from `webwaka-platform/src/analytics-reporting`
   - Move to `webwaka-platform-capabilities/src/analytics`
   - Create NPM package: `@webwaka/capability-analytics`
   - Publish v1.0.0

6. **fraud-prevention** (Week 7)
   - Extract from `webwaka-platform/src/fraud-prevention`
   - Move to `webwaka-platform-capabilities/src/fraud-prevention`
   - Create NPM package: `@webwaka/capability-fraud-prevention`
   - Publish v1.0.0

7. **contract-management** (Week 8)
   - Extract from `webwaka-platform/src/contract-management`
   - Move to `webwaka-platform-capabilities/src/contracts`
   - Create NPM package: `@webwaka/capability-contracts`
   - Publish v1.0.0

8. **headless-cms** (Week 8)
   - Extract from `webwaka-platform/src/headless-cms`
   - Move to `webwaka-platform-capabilities/src/cms`
   - Create NPM package: `@webwaka/capability-cms`
   - Publish v1.0.0

**Dependencies:** Platform Core (Phase 1)

**Risk:** MEDIUM (some cross-dependencies between capabilities)

**Rollback:** Revert to monolith imports, unpublish NPM packages

---

### Phase 3: Platform Capabilities - Tier 2 (Weeks 9-12)

**Target:** Extract commerce and membership capabilities

**Sequence:**

1. **pos** (Week 9)
   - Extract from `webwaka-platform/src/pos`
   - Move to `webwaka-platform-capabilities/src/pos`
   - Create NPM package: `@webwaka/capability-pos`
   - Publish v1.0.0

2. **svm** (Week 9)
   - Extract from `webwaka-platform/src/svm`
   - Move to `webwaka-platform-capabilities/src/svm`
   - Create NPM package: `@webwaka/capability-svm`
   - Publish v1.0.0

3. **mvm** (Week 10)
   - Extract from `webwaka-platform/src/mvm`
   - Move to `webwaka-platform-capabilities/src/mvm`
   - Create NPM package: `@webwaka/capability-mvm`
   - Publish v1.0.0

4. **inventory-sync** (Week 10)
   - Extract from `webwaka-platform/src/inventory-sync`
   - Move to `webwaka-platform-capabilities/src/inventory`
   - Create NPM package: `@webwaka/capability-inventory`
   - Publish v1.0.0

5. **sales** (Week 11)
   - Extract from `webwaka-platform/src/sales`
   - Move to `webwaka-platform-capabilities/src/sales`
   - Create NPM package: `@webwaka/capability-sales`
   - Publish v1.0.0

6. **booking-scheduling** (Week 11)
   - Extract from `webwaka-platform/src/booking-scheduling`
   - Move to `webwaka-platform-capabilities/src/booking`
   - Create NPM package: `@webwaka/capability-booking`
   - Publish v1.0.0

7. **member-management** (Week 12)
   - Extract from `webwaka-platform/src/member-management`
   - Move to `webwaka-platform-capabilities/src/membership`
   - Create NPM package: `@webwaka/capability-membership`
   - Publish v1.0.0

8. **community-platform** (Week 12)
   - Extract from `webwaka-platform/src/community-platform`
   - Move to `webwaka-platform-capabilities/src/community`
   - Create NPM package: `@webwaka/capability-community`
   - Publish v1.0.0

**Dependencies:** Platform Core, MLAS, Payment

**Risk:** HIGH (commerce capabilities have complex interdependencies)

**Rollback:** Revert to monolith imports, unpublish NPM packages

---

### Phase 4: Platform Capabilities - Tier 3 (Weeks 13-16)

**Target:** Extract builders, AI, and remaining capabilities

**Sequence:**

1. **ai-abstraction-layer** (Week 13)
   - Extract from `webwaka-platform/src/ai-abstraction-layer`
   - Move to `webwaka-platform-capabilities/src/ai`
   - Create NPM package: `@webwaka/capability-ai`
   - Publish v1.0.0

2. **ai-extension-framework** (Week 13)
   - Extract from `webwaka-platform/src/ai-extension-framework`
   - Move to `webwaka-platform-capabilities/src/ai-extensions`
   - Create NPM package: `@webwaka/capability-ai-extensions`
   - Publish v1.0.0

3. **no-code-builder** (Week 14)
   - Extract from `webwaka-platform/src/no-code-builder`
   - Move to `webwaka-platform-capabilities/src/no-code`
   - Create NPM package: `@webwaka/capability-no-code`
   - Publish v1.0.0

4. **website-builder** (Week 14)
   - Extract from `webwaka-platform/src/website-builder`
   - Move to `webwaka-platform-capabilities/src/website-builder`
   - Create NPM package: `@webwaka/capability-website-builder`
   - Publish v1.0.0

5. **sites-funnels-* (all 5 builders)** (Weeks 15-16)
   - Extract all Sites & Funnels builders
   - Move to `webwaka-platform-capabilities/src/*-builder`
   - Create NPM packages for each
   - Publish v1.0.0

6. **donations / fundraising-module** (Week 16)
   - Merge duplicates into single capability
   - Move to `webwaka-platform-capabilities/src/fundraising`
   - Create NPM package: `@webwaka/capability-fundraising`
   - Publish v1.0.0

7. **fleet-management** (Week 16)
   - Extract from `webwaka-platform/src/fleet-management`
   - Move to `webwaka-platform-capabilities/src/fleet`
   - Create NPM package: `@webwaka/capability-fleet`
   - Publish v1.0.0

8. **events (event management)** (Week 16)
   - Extract from `webwaka-platform/src/events`
   - Move to `webwaka-platform-capabilities/src/events-management`
   - Create NPM package: `@webwaka/capability-events-management`
   - Publish v1.0.0

**Dependencies:** Platform Core, Payment, Membership, CMS

**Risk:** MEDIUM (builders have UI dependencies)

**Rollback:** Revert to monolith imports, unpublish NPM packages

---

### Phase 5: Suite Extraction (Weeks 17-24)

**Target:** Extract suite-specific logic into dedicated suite repositories

**Sequence:**

1. **Commerce Suite** (Week 17)
   - Create `webwaka-suite-commerce` repository
   - Extract orchestration layer from `webwaka-platform/src/commerce`
   - Update imports to use capability packages
   - Deploy as independent service

2. **Transportation Suite** (Week 18)
   - Create `webwaka-suite-transportation` repository
   - Extract `motor-park`, `transport-company`, `transportation` orchestration
   - Update imports to use capability packages
   - Deploy as independent service

3. **Logistics Suite** (Week 19)
   - Create `webwaka-suite-logistics` repository
   - Extract `logistics` orchestration
   - Update imports to use capability packages
   - Deploy as independent service

4. **Hospitality Suite** (Weeks 20-21)
   - Create `webwaka-suite-hospitality` repository
   - Extract all `hospitality-*` modules
   - Update imports to use capability packages
   - Deploy as independent service

5. **Politics Suite** (Weeks 22-23)
   - Create `webwaka-suite-politics` repository
   - Extract all politics-related modules
   - Update imports to use capability packages
   - Deploy as independent service

6. **Monolith Retirement** (Week 24)
   - Verify all capabilities extracted
   - Verify all suites deployed
   - Archive `webwaka-platform` repository
   - Redirect all traffic to new services

**Dependencies:** All Platform Capabilities (Phases 1-4)

**Risk:** CRITICAL (full system cutover)

**Rollback:** Revert traffic routing to monolith

---

## 4. BACKWARD COMPATIBILITY WINDOWS

### 4.1. Adapter Phase (Dual-Write)

**Duration:** 1 release cycle (2 weeks)

**Pattern:**

```typescript
// Old location (adapter)
// webwaka-platform/src/payment-billing/index.ts

import { PaymentService as NewPaymentService } from '@webwaka/capability-payment';

/**
 * @deprecated Use @webwaka/capability-payment directly
 * This adapter will be removed in v2.0.0
 */
export class PaymentService extends NewPaymentService {
  constructor() {
    super();
    console.warn('DEPRECATED: Import from @webwaka/capability-payment instead');
  }
}
```

**Purpose:**
- Allow consumers to migrate at their own pace
- Prevent breaking changes during migration
- Provide deprecation warnings

---

### 4.2. Version Support Window

**Rule:** Support N and N-1 versions of all capabilities

**Example:**
- `@webwaka/capability-payment@2.0.0` (current)
- `@webwaka/capability-payment@1.x.x` (supported for 6 months)

**After 6 months:**
- v1.x.x enters sunset phase
- Security patches only
- No new features

**After 12 months:**
- v1.x.x retired
- No support

---

### 4.3. Deprecation Protocol

**Step 1: Announce (T+0)**
- Publish deprecation notice in changelog
- Add deprecation warnings to code
- Send email to all capability consumers

**Step 2: Migrate (T+1 to T+6 months)**
- Provide migration guide
- Offer migration support
- Track migration progress

**Step 3: Sunset (T+6 months)**
- Remove deprecated code
- Publish breaking change release
- Update all documentation

---

### 4.4. Freeze Periods

**No migrations during:**
- Black Friday / Cyber Monday (November)
- End of year holidays (December 20 - January 5)
- Major product launches
- Critical incident response

**Safe migration windows:**
- January - March (Q1)
- April - June (Q2)
- July - September (Q3)
- October - mid-November (Q4)

---

## 5. MIGRATION EXECUTION CHECKLIST

### Pre-Migration

- [ ] Create capability registry entry
- [ ] Document public interfaces
- [ ] Write migration guide
- [ ] Set up new repository/package
- [ ] Configure CI/CD pipeline
- [ ] Notify all downstream consumers
- [ ] Schedule migration window
- [ ] Prepare rollback plan

### During Migration

- [ ] Extract code to new location
- [ ] Create adapter in old location
- [ ] Update imports in test suite
- [ ] Run full test suite
- [ ] Deploy to staging
- [ ] Verify functionality
- [ ] Deploy to production (canary)
- [ ] Monitor metrics

### Post-Migration

- [ ] Verify all consumers migrated
- [ ] Remove adapter after 1 release cycle
- [ ] Update documentation
- [ ] Archive old code
- [ ] Update capability registry
- [ ] Send completion notice

---

## 6. ROLLBACK PROCEDURES

### Immediate Rollback (< 1 hour)

**Trigger:** Critical bug, data loss, service outage

**Action:**
1. Revert traffic routing to old location
2. Disable new capability package
3. Notify all consumers
4. Investigate root cause

### Planned Rollback (1-7 days)

**Trigger:** Performance degradation, consumer feedback, complexity issues

**Action:**
1. Announce rollback plan
2. Provide rollback timeline
3. Revert consumers incrementally
4. Archive new capability
5. Document lessons learned

---

## 7. MIGRATION METRICS

**Track:**
- Migration completion percentage
- Consumer migration rate
- Adapter usage (should decrease over time)
- Incident count during migration
- Rollback count
- Time to migrate per capability

**Success Criteria:**
- 100% capabilities extracted
- 0 adapters remaining after 6 months
- < 5% incident rate during migration
- < 2 rollbacks per phase

---

## 8. ACCEPTANCE TEST

**Question:** "What prevents someone tomorrow from rebuilding donations inside another suite?"

**Answer:**

After migration complete:
1. **Registry:** Donations capability registered at `capability.fundraising.donations`
2. **NPM Package:** Published as `@webwaka/capability-fundraising@1.0.0`
3. **CI Rule:** Detects donation logic in suite directories, fails build
4. **Adapter Removed:** Old location no longer exists, imports fail
5. **Documentation:** All docs point to new location

**Result:** Mechanical prevention + physical removal. Impossible to use old location.

---

## END OF MIGRATION FRAMEWORK
