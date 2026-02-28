# EXECUTION MIGRATION BLUEPRINT V1

**Agent Identity:** webwaka007
**Authority Level:** Founder Agent
**Priority:** CRITICAL
**Date:** 2026-02-15

---

## 1. OBJECTIVE

This document provides the authoritative, mechanical, and deterministic blueprint for migrating the WebWaka platform from its current state (a centralized monolith) to the target modular architecture defined in the governing documents. It is the direct successor to the `PLATFORM_REALITY_AUDIT_V1` and translates its findings into an executable plan.

**The instructions herein are not suggestions. They are a precise, step-by-step sequence of operations. There is no room for interpretation.** When this blueprint is executed, the architectural violations identified in the audit will be resolved.

## 2. MIGRATION OVERVIEW

The migration is categorized into three primary actions:

1.  **DELETE FROM MONOLITH:** For core infrastructure capabilities where a canonical version already exists in a dedicated repository, the illegal version within the `webwaka-platform` monolith will be deleted.
2.  **EXTRACT TO CORE:** For foundational and shared capabilities that belong in the core platform, the code will be extracted from the `webwaka-platform` monolith and moved into the `webwaka-platform-core` repository.
3.  **EXTRACT TO NEW REPO:** For all business suites (Commerce, Transportation, etc.), the code will be extracted from the `webwaka-platform` monolith and moved into new, dedicated suite repositories (e.g., `webwaka-suite-commerce`).

This blueprint details the specific actions for **50 identified capabilities**. Each section provides a complete, 12-point migration plan to be executed by the assigned engineering agents.

---

### 3. MIGRATION BLUEPRINT: EVENT-SYSTEM

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/event-system` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-modules-event-system/src` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | None. The canonical version in `/webwaka-modules-event-system` is to be used. |
| **6. Code to Delete** | `rm -rf /home/ubuntu/webwaka-audit/webwaka-platform/src/event-system` |
| **7. Adapter/Shim** | None required. All imports must point to the canonical module. |
| **8. Import Changes** | All imports pointing to `@webwaka/src/event-system` must be changed to `@modules-event-system/src`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **CRITICAL** |
| **11. Verification** | All tests in `/webwaka-modules-event-system` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: MODULE-SYSTEM

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/module-system` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-modules-module-system/src` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | None. The canonical version in `/webwaka-modules-module-system` is to be used. |
| **6. Code to Delete** | `rm -rf /home/ubuntu/webwaka-audit/webwaka-platform/src/module-system` |
| **7. Adapter/Shim** | None required. All imports must point to the canonical module. |
| **8. Import Changes** | All imports pointing to `@webwaka/src/module-system` must be changed to `@modules-module-system/src`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **CRITICAL** |
| **11. Verification** | All tests in `/webwaka-modules-module-system` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: PLUGIN-SYSTEM

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/plugin-system` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-modules-plugin-system/src` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | None. The canonical version in `/webwaka-modules-plugin-system` is to be used. |
| **6. Code to Delete** | `rm -rf /home/ubuntu/webwaka-audit/webwaka-platform/src/plugin-system` |
| **7. Adapter/Shim** | None required. All imports must point to the canonical module. |
| **8. Import Changes** | All imports pointing to `@webwaka/src/plugin-system` must be changed to `@modules-plugin-system/src`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **CRITICAL** |
| **11. Verification** | All tests in `/webwaka-modules-plugin-system` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: AUDIT-SYSTEM

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/audit-system` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/core/audit` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/core/audit` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/audit-system/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/core/audit/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/audit-system/index.ts
export * from '@webwaka/webwaka-platform-core/src/core/audit';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/audit-system` must be changed to `@platform-core/src/core/audit`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: USER-IDENTITY

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/user-identity` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/core/identity` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/core/identity` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/user-identity/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/core/identity/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/user-identity/index.ts
export * from '@webwaka/webwaka-platform-core/src/core/identity';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/user-identity` must be changed to `@platform-core/src/core/identity`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **CRITICAL** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: ECONOMIC-ENGINE

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/economic-engine` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/FOUNDER_JUDGMENT_REQUIRED/TBD` |
| **4. Future Owner** | `TBD` |
| **5. Code to Extract** | TBD - Pending Founder Judgment |
| **6. Code to Delete** | TBD - Pending Founder Judgment |
| **7. Adapter/Shim** | TBD - Pending Founder Judgment |
| **8. Import Changes** | All imports pointing to `@webwaka/src/economic-engine` must be changed to `@FOUNDER_JUDGMENT_REQUIRED/TBD`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **UNKNOWN** |
| **11. Verification** | All tests in `/FOUNDER_JUDGMENT_REQUIRED` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: EVENTS

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/events` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/FOUNDER_JUDGMENT_REQUIRED/TBD` |
| **4. Future Owner** | `TBD` |
| **5. Code to Extract** | TBD - Pending Founder Judgment |
| **6. Code to Delete** | TBD - Pending Founder Judgment |
| **7. Adapter/Shim** | TBD - Pending Founder Judgment |
| **8. Import Changes** | All imports pointing to `@webwaka/src/events` must be changed to `@FOUNDER_JUDGMENT_REQUIRED/TBD`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **UNKNOWN** |
| **11. Verification** | All tests in `/FOUNDER_JUDGMENT_REQUIRED` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: MODULES

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/modules` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/FOUNDER_JUDGMENT_REQUIRED/TBD` |
| **4. Future Owner** | `TBD` |
| **5. Code to Extract** | TBD - Pending Founder Judgment |
| **6. Code to Delete** | TBD - Pending Founder Judgment |
| **7. Adapter/Shim** | TBD - Pending Founder Judgment |
| **8. Import Changes** | All imports pointing to `@webwaka/src/modules` must be changed to `@FOUNDER_JUDGMENT_REQUIRED/TBD`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **UNKNOWN** |
| **11. Verification** | All tests in `/FOUNDER_JUDGMENT_REQUIRED` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: AI-ABSTRACTION-LAYER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/ai-abstraction-layer` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/ai` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/ai` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/ai-abstraction-layer/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/ai/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/ai-abstraction-layer/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/ai';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/ai-abstraction-layer` must be changed to `@platform-core/src/shared/ai`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: AI-EXTENSION-FRAMEWORK

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/ai-extension-framework` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/ai-extensions` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/ai-extensions` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/ai-extension-framework/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/ai-extensions/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/ai-extension-framework/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/ai-extensions';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/ai-extension-framework` must be changed to `@platform-core/src/shared/ai-extensions`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: ANALYTICS-REPORTING

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/analytics-reporting` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/analytics` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/analytics` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/analytics-reporting/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/analytics/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/analytics-reporting/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/analytics';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/analytics-reporting` must be changed to `@platform-core/src/shared/analytics`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: COMMUNICATION-TOOLS

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/communication-tools` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/communication` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/communication` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/communication-tools/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/communication/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/communication-tools/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/communication';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/communication-tools` must be changed to `@platform-core/src/shared/communication`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: CONTRACT-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/contract-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/contracts` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/contracts` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/contract-management/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/contracts/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/contract-management/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/contracts';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/contract-management` must be changed to `@platform-core/src/shared/contracts`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: FRAUD-PREVENTION

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/fraud-prevention` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/fraud-prevention` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/fraud-prevention` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/fraud-prevention/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/fraud-prevention/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/fraud-prevention/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/fraud-prevention';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/fraud-prevention` must be changed to `@platform-core/src/shared/fraud-prevention`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: HEADLESS-CMS

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/headless-cms` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/cms` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/cms` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/headless-cms/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/cms/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/headless-cms/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/cms';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/headless-cms` must be changed to `@platform-core/src/shared/cms`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: MEMBER-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/member-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/membership` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/membership` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/member-management/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/membership/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/member-management/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/membership';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/member-management` must be changed to `@platform-core/src/shared/membership`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: NO-CODE-BUILDER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/no-code-builder` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/no-code` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/no-code` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/no-code-builder/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/no-code/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/no-code-builder/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/no-code';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/no-code-builder` must be changed to `@platform-core/src/shared/no-code`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: PAYMENT-BILLING

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/payment-billing` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/payment` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/payment` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/payment-billing/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/payment/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/payment-billing/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/payment';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/payment-billing` must be changed to `@platform-core/src/shared/payment`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SEARCH-DISCOVERY

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/search-discovery` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-platform-core/src/shared/search` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/search` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/search-discovery/* /home/ubuntu/webwaka-audit/webwaka-platform-core/src/shared/search/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/search-discovery/index.ts
export * from '@webwaka/webwaka-platform-core/src/shared/search';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/search-discovery` must be changed to `@platform-core/src/shared/search`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-platform-core` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: COMMERCE

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/commerce` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-commerce/src/shared` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/shared` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/commerce/* /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/shared/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/commerce/index.ts
export * from '@webwaka/webwaka-suite-commerce/src/shared';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/commerce` must be changed to `@suite-commerce/src/shared`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-commerce` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: INVENTORY-SYNC

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/inventory-sync` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-commerce/src/inventory-sync` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/inventory-sync` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/inventory-sync/* /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/inventory-sync/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/inventory-sync/index.ts
export * from '@webwaka/webwaka-suite-commerce/src/inventory-sync';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/inventory-sync` must be changed to `@suite-commerce/src/inventory-sync`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-suite-commerce` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: MVM

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/mvm` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-commerce/src/mvm` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/mvm` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/mvm/* /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/mvm/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/mvm/index.ts
export * from '@webwaka/webwaka-suite-commerce/src/mvm';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/mvm` must be changed to `@suite-commerce/src/mvm`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-suite-commerce` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: POS

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/pos` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-commerce/src/pos` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/pos` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/pos/* /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/pos/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/pos/index.ts
export * from '@webwaka/webwaka-suite-commerce/src/pos';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/pos` must be changed to `@suite-commerce/src/pos`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-suite-commerce` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SALES

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/sales` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-commerce/src/sales` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/sales` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/sales/* /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/sales/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/sales/index.ts
export * from '@webwaka/webwaka-suite-commerce/src/sales';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/sales` must be changed to `@suite-commerce/src/sales`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-commerce` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SVM

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/svm` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-commerce/src/svm` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/svm` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/svm/* /home/ubuntu/webwaka-audit/webwaka-suite-commerce/src/svm/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/svm/index.ts
export * from '@webwaka/webwaka-suite-commerce/src/svm';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/svm` must be changed to `@suite-commerce/src/svm`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-suite-commerce` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: COMMUNITY-ORGANIZING-MODULE

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/community-organizing-module` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-community/src/organizing` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-community/src/organizing` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/community-organizing-module/* /home/ubuntu/webwaka-audit/webwaka-suite-community/src/organizing/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/community-organizing-module/index.ts
export * from '@webwaka/webwaka-suite-community/src/organizing';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/community-organizing-module` must be changed to `@suite-community/src/organizing`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-community` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: COMMUNITY-PLATFORM

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/community-platform` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-community/src/platform` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-community/src/platform` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/community-platform/* /home/ubuntu/webwaka-audit/webwaka-suite-community/src/platform/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/community-platform/index.ts
export * from '@webwaka/webwaka-suite-community/src/platform';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/community-platform` must be changed to `@suite-community/src/platform`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-community` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: DONATIONS

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/donations` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-fundraising/src/donations` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-fundraising/src/donations` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/donations/* /home/ubuntu/webwaka-audit/webwaka-suite-fundraising/src/donations/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/donations/index.ts
export * from '@webwaka/webwaka-suite-fundraising/src/donations';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/donations` must be changed to `@suite-fundraising/src/donations`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-fundraising` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: FUNDRAISING-MODULE

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/fundraising-module` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-fundraising/src/fundraising` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-fundraising/src/fundraising` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/fundraising-module/* /home/ubuntu/webwaka-audit/webwaka-suite-fundraising/src/fundraising/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/fundraising-module/index.ts
export * from '@webwaka/webwaka-suite-fundraising/src/fundraising';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/fundraising-module` must be changed to `@suite-fundraising/src/fundraising`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-fundraising` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: BOOKING-SCHEDULING

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/booking-scheduling` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-hospitality/src/booking-scheduling` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/booking-scheduling` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/booking-scheduling/* /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/booking-scheduling/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/booking-scheduling/index.ts
export * from '@webwaka/webwaka-suite-hospitality/src/booking-scheduling';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/booking-scheduling` must be changed to `@suite-hospitality/src/booking-scheduling`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-hospitality` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: HOSPITALITY-BOOKING-ENGINE

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/hospitality-booking-engine` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-hospitality/src/booking-engine` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/booking-engine` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/hospitality-booking-engine/* /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/booking-engine/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/hospitality-booking-engine/index.ts
export * from '@webwaka/webwaka-suite-hospitality/src/booking-engine';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/hospitality-booking-engine` must be changed to `@suite-hospitality/src/booking-engine`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-suite-hospitality` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: HOSPITALITY-CHANNEL-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/hospitality-channel-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-hospitality/src/channel-management` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/channel-management` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/hospitality-channel-management/* /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/channel-management/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/hospitality-channel-management/index.ts
export * from '@webwaka/webwaka-suite-hospitality/src/channel-management';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/hospitality-channel-management` must be changed to `@suite-hospitality/src/channel-management`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-hospitality` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: HOSPITALITY-GUEST-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/hospitality-guest-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-hospitality/src/guest-management` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/guest-management` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/hospitality-guest-management/* /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/guest-management/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/hospitality-guest-management/index.ts
export * from '@webwaka/webwaka-suite-hospitality/src/guest-management';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/hospitality-guest-management` must be changed to `@suite-hospitality/src/guest-management`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-hospitality` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: HOSPITALITY-PROPERTY-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/hospitality-property-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-hospitality/src/property-management` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/property-management` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/hospitality-property-management/* /home/ubuntu/webwaka-audit/webwaka-suite-hospitality/src/property-management/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/hospitality-property-management/index.ts
export * from '@webwaka/webwaka-suite-hospitality/src/property-management';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/hospitality-property-management` must be changed to `@suite-hospitality/src/property-management`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-hospitality` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: LOGISTICS

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/logistics` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-logistics/src` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-logistics/src` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/logistics/* /home/ubuntu/webwaka-audit/webwaka-suite-logistics/src/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/logistics/index.ts
export * from '@webwaka/webwaka-suite-logistics/src';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/logistics` must be changed to `@suite-logistics/src`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-logistics` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: CAMPAIGN-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/campaign-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-politics/src/campaign-management` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/campaign-management` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/campaign-management/* /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/campaign-management/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/campaign-management/index.ts
export * from '@webwaka/webwaka-suite-politics/src/campaign-management';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/campaign-management` must be changed to `@suite-politics/src/campaign-management`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-politics` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: CONSTITUENCY-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/constituency-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-politics/src/constituency-management` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/constituency-management` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/constituency-management/* /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/constituency-management/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/constituency-management/index.ts
export * from '@webwaka/webwaka-suite-politics/src/constituency-management';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/constituency-management` must be changed to `@suite-politics/src/constituency-management`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-politics` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: POLITICAL-ANALYTICS-MODULE

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/political-analytics-module` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-politics/src/analytics` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/analytics` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/political-analytics-module/* /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/analytics/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/political-analytics-module/index.ts
export * from '@webwaka/webwaka-suite-politics/src/analytics';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/political-analytics-module` must be changed to `@suite-politics/src/analytics`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-politics` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: POLLING-RESULTS

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/polling-results` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-politics/src/polling` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/polling` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/polling-results/* /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/polling/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/polling-results/index.ts
export * from '@webwaka/webwaka-suite-politics/src/polling';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/polling-results` must be changed to `@suite-politics/src/polling`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-politics` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: VOTER-ENGAGEMENT-MODULE

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/voter-engagement-module` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-politics/src/voter-engagement` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/voter-engagement` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/voter-engagement-module/* /home/ubuntu/webwaka-audit/webwaka-suite-politics/src/voter-engagement/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/voter-engagement-module/index.ts
export * from '@webwaka/webwaka-suite-politics/src/voter-engagement';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/voter-engagement-module` must be changed to `@suite-politics/src/voter-engagement`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-politics` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SITES-FUNNELS-EMAIL-CAMPAIGN-BUILDER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/sites-funnels-email-campaign-builder` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-sites-funnels/src/email-campaign-builder` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/email-campaign-builder` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/sites-funnels-email-campaign-builder/* /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/email-campaign-builder/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/sites-funnels-email-campaign-builder/index.ts
export * from '@webwaka/webwaka-suite-sites-funnels/src/email-campaign-builder';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/sites-funnels-email-campaign-builder` must be changed to `@suite-sites-funnels/src/email-campaign-builder`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-sites-funnels` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SITES-FUNNELS-FORM-BUILDER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/sites-funnels-form-builder` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-sites-funnels/src/form-builder` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/form-builder` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/sites-funnels-form-builder/* /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/form-builder/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/sites-funnels-form-builder/index.ts
export * from '@webwaka/webwaka-suite-sites-funnels/src/form-builder';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/sites-funnels-form-builder` must be changed to `@suite-sites-funnels/src/form-builder`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-sites-funnels` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SITES-FUNNELS-LANDING-PAGE-BUILDER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/sites-funnels-landing-page-builder` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-sites-funnels/src/landing-page-builder` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/landing-page-builder` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/sites-funnels-landing-page-builder/* /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/landing-page-builder/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/sites-funnels-landing-page-builder/index.ts
export * from '@webwaka/webwaka-suite-sites-funnels/src/landing-page-builder';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/sites-funnels-landing-page-builder` must be changed to `@suite-sites-funnels/src/landing-page-builder`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-sites-funnels` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SITES-FUNNELS-SALES-FUNNEL-BUILDER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/sites-funnels-sales-funnel-builder` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-sites-funnels/src/sales-funnel-builder` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/sales-funnel-builder` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/sites-funnels-sales-funnel-builder/* /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/sales-funnel-builder/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/sites-funnels-sales-funnel-builder/index.ts
export * from '@webwaka/webwaka-suite-sites-funnels/src/sales-funnel-builder';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/sites-funnels-sales-funnel-builder` must be changed to `@suite-sites-funnels/src/sales-funnel-builder`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-sites-funnels` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: SITES-FUNNELS-WEBSITE-BUILDER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/sites-funnels-website-builder` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-sites-funnels/src/website-builder` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/website-builder` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/sites-funnels-website-builder/* /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/website-builder/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/sites-funnels-website-builder/index.ts
export * from '@webwaka/webwaka-suite-sites-funnels/src/website-builder';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/sites-funnels-website-builder` must be changed to `@suite-sites-funnels/src/website-builder`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-sites-funnels` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: WEBSITE-BUILDER

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/website-builder` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-sites-funnels/src/website-builder-legacy` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/website-builder-legacy` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/website-builder/* /home/ubuntu/webwaka-audit/webwaka-suite-sites-funnels/src/website-builder-legacy/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/website-builder/index.ts
export * from '@webwaka/webwaka-suite-sites-funnels/src/website-builder-legacy';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/website-builder` must be changed to `@suite-sites-funnels/src/website-builder-legacy`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **LOW** |
| **11. Verification** | All tests in `/webwaka-suite-sites-funnels` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: FLEET-MANAGEMENT

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/fleet-management` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-transportation/src/fleet-management` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/fleet-management` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/fleet-management/* /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/fleet-management/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/fleet-management/index.ts
export * from '@webwaka/webwaka-suite-transportation/src/fleet-management';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/fleet-management` must be changed to `@suite-transportation/src/fleet-management`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-transportation` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: MOTOR-PARK

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/motor-park` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-transportation/src/motor-park` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/motor-park` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/motor-park/* /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/motor-park/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/motor-park/index.ts
export * from '@webwaka/webwaka-suite-transportation/src/motor-park';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/motor-park` must be changed to `@suite-transportation/src/motor-park`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-transportation` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: TRANSPORT-COMPANY

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/transport-company` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-transportation/src/transport-company` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/transport-company` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/transport-company/* /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/transport-company/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/transport-company/index.ts
export * from '@webwaka/webwaka-suite-transportation/src/transport-company';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/transport-company` must be changed to `@suite-transportation/src/transport-company`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **MEDIUM** |
| **11. Verification** | All tests in `/webwaka-suite-transportation` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

### 3. MIGRATION BLUEPRINT: TRANSPORTATION

| Item | Description |
|---|---|
| **1. Current Location** | `/webwaka-platform/src/transportation` |
| **2. Canonical Status** | **Illegal** |
| **3. Future Location** | `/webwaka-suite-transportation/src/core` |
| **4. Future Owner** | `webwakaagent4` |
| **5. Code to Extract** | `mkdir -p /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/core` and `mv /home/ubuntu/webwaka-audit/webwaka-platform/src/transportation/* /home/ubuntu/webwaka-audit/webwaka-suite-transportation/src/core/` |
| **6. Code to Delete** | The `mv` command handles deletion from the source. The empty source directory can be removed. |
| **7. Adapter/Shim** | Initially, create a temporary re-export from the old location to the new location to allow for phased import updates. `// webwaka-platform/src/transportation/index.ts
export * from '@webwaka/webwaka-suite-transportation/src/core';` |
| **8. Import Changes** | All imports pointing to `@webwaka/src/transportation` must be changed to `@suite-transportation/src/core`. |
| **9. Migration Sequence** | 1. Lock the source directory (read-only). 2. Create the target repository if it does not exist. 3. Execute the move/delete operation. 4. Update all relevant `package.json` dependencies across all repositories. 5. Run `grep` across all repositories to find all imports and update them. 6. Run `pnpm install` in all affected repositories. 7. Run all tests. |
| **10. Risk Level** | **HIGH** |
| **11. Verification** | All tests in `/webwaka-suite-transportation` must pass. The entire platform must build and run successfully. A manual E2E test of the migrated capability must be performed. |
| **12. Rollback Plan** | `git revert <commit_hash>` of the migration commit. The temporary re-export shim (if used) will prevent immediate breakage during the phased update. |

---

## 4. SUMMARY OF HIGH-RISK MIGRATIONS & FOUNDER JUDGMENT

### 4.1. Top 10 Highest Risk Migrations

This list highlights the migrations with the highest potential for disruption and complexity. They must be executed with extreme care and thorough verification.

1.  **event-system (CRITICAL):** Deleting the illegal monolith version and re-pointing all imports to the canonical `webwaka-modules-event-system` is a fundamental, cross-cutting change.
2.  **module-system (CRITICAL):** Same as the event system, this impacts how the entire platform loads and manages code.
3.  **plugin-system (CRITICAL):** Same as the event system, this impacts platform extensibility.
4.  **user-identity (CRITICAL):** Extracting identity to `platform-core` is a critical change that affects all authentication and authorization across the platform.
5.  **audit-system (HIGH):** Migrating the audit system to `platform-core` requires ensuring no audit logs are lost and that all services correctly integrate with the new location.
6.  **payment-billing (HIGH):** Financial systems are inherently high-risk. This migration requires meticulous testing to ensure no transactions are dropped or mis-handled.
7.  **fraud-prevention (HIGH):** Migrating this shared service requires ensuring all fraud detection rules are correctly applied post-migration.
8.  **ai-abstraction-layer (HIGH):** Moving the AI layer to `platform-core` will require updating all services that rely on it and ensuring all model integrations remain functional.
9.  **pos (HIGH):** As a primary user-facing application, any downtime or bugs in the POS system will have an immediate business impact.
10. **inventory-sync (HIGH):** The logic for synchronizing inventory across POS, SVM, and MVM is complex and critical for data consistency.

### 4.2. Domains Requiring Founder Judgment

The following capabilities are classified as **ORPHAN** or **UNKNOWN**. Their purpose could not be determined from the codebase or documentation. A Founder decision is required to either **deprecate and delete** them or to **assign them a clear purpose and target location**.

| Capability | Current Location | Analysis |
|---|---|---|
| `economic-engine` | `/webwaka-platform/src/economic-engine` | Purpose is entirely unclear. No documentation exists. | 
| `events` | `/webwaka-platform/src/events` | This appears to be a *third* implementation of an event system, separate from the two already identified. Its existence is a major anomaly. |
| `modules` | `/webwaka-platform/src/modules` | This directory contains other core-sounding components (`api-layer`, `sync-engine`, `weeg`). It is unclear why they are nested here. |

---

**END OF BLUEPRINT**
