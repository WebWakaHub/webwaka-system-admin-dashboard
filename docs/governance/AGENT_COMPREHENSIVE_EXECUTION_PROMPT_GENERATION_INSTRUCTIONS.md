# COMPREHENSIVE EXECUTION PROMPT GENERATION INSTRUCTIONS FOR AGENT
⚠️ CONFIDENTIAL - DO NOT COMMIT TO GITHUB - CONTAINS CREDENTIALS

Version: 1.0
Date: 2026-02-12
Status: READY FOR AGENT EXECUTION

---

## CRITICAL INSTRUCTION - READ CAREFULLY

You are being assigned to generate comprehensive step-by-step execution prompts for all suites in the WebWaka platform implementation. 

**CRITICAL REQUIREMENT: EVERY FILE MUST BE 100% COMPLETE WITH ALL STEPS FULLY WRITTEN OUT. NO CONTINUATION PATTERNS. NO ABBREVIATIONS. NO SHORTCUTS. EVERY SINGLE STEP FOR EVERY SINGLE MODULE MUST BE FULLY DETAILED AND READY FOR DIRECT COPY-PASTE EXECUTION.**

---

## WHAT YOU WILL DELIVER

You will create ONE COMPLETE FILE for each of the following 15 categories:

1. **SHARED_PRIMITIVES_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all 9 primitives fully written
2. **SITES_AND_FUNNELS_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all 5 modules fully written
3. **POLITICS_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all 9 modules fully written
4. **LOGISTICS_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all 6 modules fully written
5. **HOSPITALITY_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
6. **CHURCH_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
7. **HEALTH_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
8. **EDUCATION_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
9. **PROJECT_MANAGEMENT_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
10. **COMMUNITY_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
11. **RIDE_HAILING_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
12. **RIDESHARING_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
13. **REAL_ESTATE_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
14. **RECRUITMENT_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written
15. **CIVIC_SUITE_COMPLETE_EXECUTION_PROMPTS.md** - 100% complete with all modules fully written

---

## SOURCE DOCUMENT

You have access to the complete task breakdown:

**MASTER_IMPLEMENTATION_TASKS.md** (https://github.com/WebWakaHub/webwaka-governance/blob/master/MASTER_IMPLEMENTATION_TASKS.md)

This document contains:
- Every task for every module in every suite
- Complete task descriptions
- All deliverables for each task
- All success criteria for each task
- Exact module names and organization

---

## EXACT PROMPT FORMAT TO FOLLOW

Every single step in every file must follow this EXACT format with NO VARIATIONS:

```
### STEP [NUMBER]: [AGENT_NAME] - [WEEK/TIMEFRAME] [MODULE_NAME] [TASK_TYPE]

You are now operating as [AGENT_NAME] because you will perform all tasks assigned to [AGENT_NAME]

Use this PAT for CLI to access the repos and for all GitHub-related tasks because they are private repos:
[PAT_TOKEN]

Commit to GitHub step by step as you progress.

You are at Step [NUMBER] of the Master Implementation Tasks.

**Your task:** [EXACT TASK DESCRIPTION FROM MASTER_IMPLEMENTATION_TASKS.md]

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, then access the following documents:

1. MASTER_IMPLEMENTATION_TASKS.md (https://github.com/WebWakaHub/webwaka-governance/blob/master/MASTER_IMPLEMENTATION_TASKS.md)
2. [REFERENCE_DOCUMENT_1]
3. [REFERENCE_DOCUMENT_2]
4. [REFERENCE_DOCUMENT_3]
... (continue with all relevant reference documents)

Locate Step [NUMBER] in MASTER_IMPLEMENTATION_TASKS.md. Execute ONLY the [TASK_TYPE] task for [MODULE_NAME] as specified:

**Task:** [FULL_TASK_DESCRIPTION_FROM_MASTER_DOCUMENT]

**Deliverables:**
1. [DELIVERABLE_1_EXACT_FROM_MASTER]
2. [DELIVERABLE_2_EXACT_FROM_MASTER]
3. [DELIVERABLE_3_EXACT_FROM_MASTER]
4. [DELIVERABLE_4_EXACT_FROM_MASTER]

**Success Criteria:**
- [SUCCESS_CRITERION_1_EXACT_FROM_MASTER]
- [SUCCESS_CRITERION_2_EXACT_FROM_MASTER]
- [SUCCESS_CRITERION_3_EXACT_FROM_MASTER]
- [SUCCESS_CRITERION_4_EXACT_FROM_MASTER]

Do not execute other steps or milestones. Report completion when done.

---
```

---

## AGENT ASSIGNMENTS AND PAT TOKENS

Use these exact assignments and tokens for EVERY step:

| Agent | PAT Token |
|-------|-----------|
| webwakaagent3 (Architecture) | [REDACTED-PAT] |
| webwakaagent4 (Engineering) | [REDACTED-PAT] |
| webwakaagent5 (Quality) | [REDACTED-PAT] |
| webwaka007 (Founder) | [REDACTED-PAT] |

---

## REFERENCE DOCUMENTS TO INCLUDE

For EVERY step, include these reference documents:

### Always Include (in every step):
1. MASTER_IMPLEMENTATION_TASKS.md

### Include for Specification Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. MODULE_SPECIFICATION_TEMPLATE.md
3. WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md
4. NIGERIAN_FIRST_COMPLIANCE_CHECKLIST.md
5. MOBILE_FIRST_PWA_FIRST_TESTING_STRATEGY.md
6. AFRICA_FIRST_LOCALIZATION_STRATEGY.md

### Include for Review Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. [MODULE_NAME]_SPECIFICATION.md
3. QUALITY_GATES_AND_RISK_MANAGEMENT.md

### Include for Test Strategy Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. [MODULE_NAME]_SPECIFICATION.md
3. QUALITY_GATES_AND_RISK_MANAGEMENT.md
4. MOBILE_FIRST_PWA_FIRST_TESTING_STRATEGY.md

### Include for Implementation Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. [MODULE_NAME]_SPECIFICATION.md

### Include for Unit Test Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. [MODULE_NAME]_TEST_STRATEGY.md
3. [MODULE_NAME]_SPECIFICATION.md

### Include for Integration Test Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. [MODULE_NAME]_TEST_STRATEGY.md

### Include for Bug Fix Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. [MODULE_NAME]_SPECIFICATION.md

### Include for Documentation Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. [MODULE_NAME]_SPECIFICATION.md

### Include for Validation Checkpoint Steps:
1. MASTER_IMPLEMENTATION_TASKS.md
2. VALIDATION_CHECKPOINT_PLAN.md
3. [MODULE_NAME]_SPECIFICATION.md

---

## STEP PATTERN FOR EACH MODULE

EVERY module in EVERY suite follows this EXACT 9-STEP PATTERN:

**Step 1: webwakaagent3 - [Module Name] Specification**
- Task: Define [Module Name] specification using MODULE_SPECIFICATION_TEMPLATE.md
- Deliverables: [MODULE]_SPECIFICATION.md, GitHub commit, Issue comment, Checklist update
- Success: Specification follows template, all invariants addressed, compliance included, approved by webwakaagent4 and webwakaagent5

**Step 2: webwakaagent4 - Review [Module Name] Specification**
- Task: Review [Module Name] specification for implementation feasibility
- Deliverables: [MODULE]_SPECIFICATION_REVIEW.md, GitHub commit, Issue comment, Checklist update
- Success: All sections reviewed, feasibility confirmed, risks identified, approval/feedback provided

**Step 3: webwakaagent5 - Define [Module Name] Test Strategy**
- Task: Define [Module Name] test strategy
- Deliverables: [MODULE]_TEST_STRATEGY.md, GitHub commit, Issue comment, Checklist update
- Success: Strategy covers all test types, 100% coverage target, Mobile-First & PWA-First requirements, environment specified

**Step 4: webwakaagent4 - Implement [Module Name]**
- Task: Implement [Module Name] complete functionality
- Deliverables: Implementation complete in webwaka-platform, GitHub commits, Checklist update
- Success: All features implemented per specification, code follows standards, ready for testing

**Step 5: webwakaagent5 - Write [Module Name] Unit Tests**
- Task: Write [Module Name] unit tests (100% coverage target)
- Deliverables: Unit tests complete (100% coverage), test coverage report, GitHub commits, Checklist update
- Success: 100% code coverage achieved, all unit tests pass

**Step 6: webwakaagent5 - Run [Module Name] Integration Tests**
- Task: Run [Module Name] integration tests
- Deliverables: Integration tests complete, test results report, GitHub commits, Checklist update
- Success: All integration tests pass, test results documented

**Step 7: webwakaagent4 - Fix [Module Name] Bugs**
- Task: Fix [Module Name] bugs identified in testing
- Deliverables: All bugs fixed in webwaka-platform, GitHub commits, Checklist update
- Success: All bugs fixed, all tests pass, code quality maintained

**Step 8: webwakaagent3 - Write [Module Name] Documentation**
- Task: Write [Module Name] module documentation
- Deliverables: [MODULE]_DOCUMENTATION.md, GitHub commit in /documentation/, Checklist update
- Success: Documentation complete and comprehensive, API documentation included, usage examples included

**Step 9: webwaka007 - [Module Name] Validation Checkpoint Review**
- Task: Review [Module Name] validation checkpoint
- Deliverables: [MODULE]_VALIDATION_CHECKPOINT_DECISION.md, GitHub commit in /founder-agent-reviews/, Issue update, Checklist update
- Success: All validation criteria reviewed, quality assessment provided, approval/feedback given, deployment authorized (if approved)

---

## EXTRACTION FROM MASTER_IMPLEMENTATION_TASKS.md

For each suite and module, you MUST:

1. **Locate the suite section** in MASTER_IMPLEMENTATION_TASKS.md
2. **Extract module names** exactly as written
3. **Extract task descriptions** exactly as written for each step type
4. **Extract deliverables** exactly as written for each step type
5. **Extract success criteria** exactly as written for each step type
6. **Calculate step numbers** sequentially with no gaps
7. **Assign agents** following the 9-step pattern consistently

---

## FILE STRUCTURE FOR EACH COMPLETE FILE

Each of the 15 files must have this structure:

```
# [SUITE_NAME] SUITE - COMPLETE EXECUTION PROMPTS
⚠️ CONFIDENTIAL - DO NOT COMMIT TO GITHUB - CONTAINS CREDENTIALS

Version: 1.0
Date: 2026-02-12
Status: READY FOR EXECUTION

---

## [Suite Name] Suite Implementation (Steps XXX-YYY)

### STEP XXX: [Agent] - [Module 1] Specification
[FULL STEP 1 PROMPT]

---

### STEP XXX+1: [Agent] - [Module 1] Review Specification
[FULL STEP 2 PROMPT]

---

### STEP XXX+2: [Agent] - [Module 1] Define Test Strategy
[FULL STEP 3 PROMPT]

---

### STEP XXX+3: [Agent] - [Module 1] Implement
[FULL STEP 4 PROMPT]

---

### STEP XXX+4: [Agent] - [Module 1] Write Unit Tests
[FULL STEP 5 PROMPT]

---

### STEP XXX+5: [Agent] - [Module 1] Run Integration Tests
[FULL STEP 6 PROMPT]

---

### STEP XXX+6: [Agent] - [Module 1] Fix Bugs
[FULL STEP 7 PROMPT]

---

### STEP XXX+7: [Agent] - [Module 1] Write Documentation
[FULL STEP 8 PROMPT]

---

### STEP XXX+8: [Agent] - [Module 1] Validation Checkpoint Review
[FULL STEP 9 PROMPT]

---

### STEP XXX+9: [Agent] - [Module 2] Specification
[FULL STEP 10 PROMPT - REPEAT 9-STEP PATTERN FOR MODULE 2]

---

[CONTINUE THIS PATTERN FOR ALL REMAINING MODULES IN THE SUITE]

---

## [Suite Name] Suite Summary

**Total Steps:** [Calculate total]

**Modules:**
1. [Module 1] (Steps XXX-YYY)
2. [Module 2] (Steps XXX-YYY)
3. [Module 3] (Steps XXX-YYY)
... (list all modules with their step ranges)

**End of [Suite Name] Suite Prompts**
```

---

## CRITICAL REQUIREMENTS - NO EXCEPTIONS

1. **100% COMPLETE** - Every single step for every single module must be fully written out
2. **NO CONTINUATION PATTERNS** - Do not use "CONTINUATION PATTERN" or "Steps XXX-YYY follow the same pattern"
3. **NO ABBREVIATIONS** - Write out every step in full detail
4. **NO SHORTCUTS** - Every deliverable and success criterion must be explicitly stated
5. **EXACT FORMAT** - Follow the format template precisely for every step
6. **EXACT EXTRACTION** - Use exact text from MASTER_IMPLEMENTATION_TASKS.md for tasks, deliverables, and success criteria
7. **SEQUENTIAL STEPS** - Number steps sequentially with no gaps
8. **COMPLETE REFERENCES** - Include all required reference documents for each step type
9. **READY FOR COPY-PASTE** - Files must be 100% ready for direct copy-paste execution by agents
10. **NO VARIATIONS** - Every step follows the same format with no deviations

---

## SUITE INFORMATION FROM MASTER_IMPLEMENTATION_TASKS.md

Extract the following information for each suite:

### Shared Primitives
- Extract all 9 primitives and their modules
- Generate 9 × 9 = 81 complete steps (9 steps per primitive)

### Sites & Funnels Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Politics Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Logistics Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Hospitality Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Church Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Health Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Education Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Project Management Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Community Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Ride-Hailing Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Ridesharing Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Real Estate Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Recruitment Suite
- Extract all modules
- Generate complete steps (9 steps per module)

### Civic Suite
- Extract all modules
- Generate complete steps (9 steps per module)

---

## EXECUTION WORKFLOW

1. **Access MASTER_IMPLEMENTATION_TASKS.md** from webwaka-governance repository
2. **For each suite in order:**
   - Extract all modules
   - For each module, generate all 9 steps
   - Write complete step prompts using exact format
   - Include all reference documents
   - Include all deliverables and success criteria
3. **Create file header** with version, date, status
4. **Save file** with naming convention: [SUITE_NAME]_COMPLETE_EXECUTION_PROMPTS.md
5. **Verify completeness** - Every step fully written, no continuation patterns
6. **Commit to repository** - Push to webwaka-governance
7. **Repeat for all 15 categories**

---

## VERIFICATION CHECKLIST

Before considering a file complete, verify:

- [ ] File header present with version, date, status
- [ ] All modules for the suite are included
- [ ] Every module has exactly 9 steps
- [ ] Every step follows the exact format template
- [ ] Every step has correct agent assignment and PAT token
- [ ] Every step has all required reference documents
- [ ] Every step has exact task description from MASTER_IMPLEMENTATION_TASKS.md
- [ ] Every step has all deliverables explicitly listed
- [ ] Every step has all success criteria explicitly listed
- [ ] No "CONTINUATION PATTERN" language anywhere
- [ ] No abbreviations or shortcuts
- [ ] Steps are numbered sequentially with no gaps
- [ ] Suite summary at end lists all modules with step ranges
- [ ] File is ready for direct copy-paste execution
- [ ] File has been committed to webwaka-governance repository

---

## FINAL DELIVERABLES

Upon completion, you will have created 15 files:

1. SHARED_PRIMITIVES_COMPLETE_EXECUTION_PROMPTS.md
2. SITES_AND_FUNNELS_SUITE_COMPLETE_EXECUTION_PROMPTS.md
3. POLITICS_SUITE_COMPLETE_EXECUTION_PROMPTS.md
4. LOGISTICS_SUITE_COMPLETE_EXECUTION_PROMPTS.md
5. HOSPITALITY_SUITE_COMPLETE_EXECUTION_PROMPTS.md
6. CHURCH_SUITE_COMPLETE_EXECUTION_PROMPTS.md
7. HEALTH_SUITE_COMPLETE_EXECUTION_PROMPTS.md
8. EDUCATION_SUITE_COMPLETE_EXECUTION_PROMPTS.md
9. PROJECT_MANAGEMENT_SUITE_COMPLETE_EXECUTION_PROMPTS.md
10. COMMUNITY_SUITE_COMPLETE_EXECUTION_PROMPTS.md
11. RIDE_HAILING_SUITE_COMPLETE_EXECUTION_PROMPTS.md
12. RIDESHARING_SUITE_COMPLETE_EXECUTION_PROMPTS.md
13. REAL_ESTATE_SUITE_COMPLETE_EXECUTION_PROMPTS.md
14. RECRUITMENT_SUITE_COMPLETE_EXECUTION_PROMPTS.md
15. CIVIC_SUITE_COMPLETE_EXECUTION_PROMPTS.md

All files will be:
- 100% complete with all steps fully written
- Ready for direct copy-paste execution
- Committed to webwaka-governance repository
- Available for immediate agent execution

---

## SUCCESS DEFINITION

Your task is complete when:

1. All 15 files are created
2. Each file contains 100% of the steps for that suite/category
3. No file contains any "CONTINUATION PATTERN" language
4. Every step is fully detailed and ready for copy-paste execution
5. All files are committed to webwaka-governance repository
6. All files follow the exact format template
7. All files extract exact information from MASTER_IMPLEMENTATION_TASKS.md
8. All files are ready for immediate agent execution

---

## IMPORTANT NOTES

- Do not skip any modules
- Do not abbreviate any steps
- Do not use continuation patterns
- Do not create partial files
- Do not leave any step incomplete
- Every file must be 100% ready for use
- Every step must be copy-paste ready
- No further work should be needed by anyone else

Good luck. The success of the entire platform implementation depends on these files being complete, accurate, and ready for execution.
