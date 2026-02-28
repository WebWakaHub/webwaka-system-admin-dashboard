# WEBWAKA007 - EXECUTION PROMPT GENERATION GUIDE
⚠️ CONFIDENTIAL - DO NOT COMMIT TO GITHUB - CONTAINS CREDENTIALS

Version: 1.0
Date: 2026-02-12
Status: READY FOR AGENT EXECUTION

---

## OBJECTIVE

You are webwaka007 (Founder Agent). Your task is to prepare comprehensive step-by-step execution prompts for all remaining suites based on the MASTER_IMPLEMENTATION_TASKS.md document. The prompts will follow the exact format demonstrated in the reference document (Pasted_content_100.txt) and will be delivered one file per suite.

---

## REFERENCE MATERIALS

The following reference materials have been prepared for your guidance:

1. **MASTER_IMPLEMENTATION_TASKS.md** - Complete task breakdown for all shared primitives and 14 suites
   - Location: https://github.com/WebWakaHub/webwaka-governance/blob/master/MASTER_IMPLEMENTATION_TASKS.md
   - Contains: Full task descriptions, deliverables, and success criteria for every module

2. **Reference Format Document** - Example of exact prompt structure
   - Contains: PHASE 3 COMMERCE SUITE prompts showing the precise format to follow
   - Demonstrates: How to structure each step, include PATs, reference documents, and success criteria

3. **Sample Execution Prompts Already Generated**:
   - SHARED_PRIMITIVES_EXECUTION_PROMPTS.md (80 steps for 9 primitives)
   - SITES_AND_FUNNELS_SUITE_EXECUTION_PROMPTS.md (45 steps for 5 modules)
   - POLITICS_SUITE_EXECUTION_PROMPTS.md (77 steps for 9 modules)
   - LOGISTICS_SUITE_EXECUTION_PROMPTS.md (55 steps for 6 modules)

---

## PROMPT GENERATION INSTRUCTIONS

### Format Requirements

Each execution prompt file must follow this exact structure:

```
# [SUITE_NAME] SUITE - COMPLETE EXECUTION PROMPTS
⚠️ CONFIDENTIAL - DO NOT COMMIT TO GITHUB - CONTAINS CREDENTIALS

Version: 1.0
Date: 2026-02-12
Status: READY FOR EXECUTION

---

## [Suite Name] Suite Implementation (Steps XXX-YYY)

### STEP XXX: [Agent] - [Module Name] Specification

You are now operating as [Agent] because you will perform all tasks assigned to [Agent]

Use this PAT for CLI to access the repos and for all GitHub-related tasks because they are private repos:
[PAT_TOKEN]

Commit to GitHub step by step as you progress.

You are at Step XXX of the Master Implementation Tasks.

**Your task:** [Task Description]

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, then access the following documents:

1. MASTER_IMPLEMENTATION_TASKS.md (https://github.com/WebWakaHub/webwaka-governance/blob/master/MASTER_IMPLEMENTATION_TASKS.md)
2. [Reference Document 1]
3. [Reference Document 2]
... (additional reference documents as needed)

Locate Step XXX in MASTER_IMPLEMENTATION_TASKS.md. Execute ONLY the [task type] task for [Module Name] as specified:

**Task:** [Full task description from MASTER_IMPLEMENTATION_TASKS.md]

**Deliverables:**
1. [Deliverable 1]
2. [Deliverable 2]
3. [Deliverable 3]
4. [Deliverable 4]

**Success Criteria:**
- [Success criterion 1]
- [Success criterion 2]
- [Success criterion 3]

Do not execute other steps or milestones. Report completion when done.

---
```

### Agent PAT Tokens

Use these PAT tokens consistently for each agent:

- **webwakaagent3** (Architecture): [REDACTED-PAT]
- **webwakaagent4** (Engineering): [REDACTED-PAT]
- **webwakaagent5** (Quality): [REDACTED-PAT]
- **webwaka007** (Founder): [REDACTED-PAT]

### 9-Step Pattern for Each Module

Every module follows this exact 9-step pattern:

1. **webwakaagent3 - Specification** (Week X)
   - Task: Define [Module] specification using MODULE_SPECIFICATION_TEMPLATE.md
   - Deliverables: [MODULE]_SPECIFICATION.md, GitHub commit, Issue comment, Checklist update
   - Success: Specification complete, all invariants addressed, compliance included, approved by webwakaagent4 and webwakaagent5

2. **webwakaagent4 - Review Specification** (Week X)
   - Task: Review [Module] specification for implementation feasibility
   - Deliverables: [MODULE]_SPECIFICATION_REVIEW.md, GitHub commit, Issue comment, Checklist update
   - Success: All sections reviewed, feasibility confirmed, risks identified, approval/feedback provided

3. **webwakaagent5 - Define Test Strategy** (Week X)
   - Task: Define [Module] test strategy
   - Deliverables: [MODULE]_TEST_STRATEGY.md, GitHub commit, Issue comment, Checklist update
   - Success: Strategy covers all test types, 100% coverage target, Mobile-First & PWA-First requirements, environment specified

4. **webwakaagent4 - Implement** (Week X-Y)
   - Task: Implement [Module] complete functionality
   - Deliverables: Implementation complete in webwaka-platform, GitHub commits, Checklist update
   - Success: All features implemented per specification, code follows standards, ready for testing

5. **webwakaagent5 - Write Unit Tests** (Week X-Y)
   - Task: Write [Module] unit tests (100% coverage target)
   - Deliverables: Unit tests complete (100% coverage), test coverage report, GitHub commits, Checklist update
   - Success: 100% code coverage achieved, all unit tests pass

6. **webwakaagent5 - Run Integration Tests** (Week Z)
   - Task: Run [Module] integration tests
   - Deliverables: Integration tests complete, test results report, GitHub commits, Checklist update
   - Success: All integration tests pass, test results documented

7. **webwakaagent4 - Fix Bugs** (Week Z)
   - Task: Fix [Module] bugs identified in testing
   - Deliverables: All bugs fixed in webwaka-platform, GitHub commits, Checklist update
   - Success: All bugs fixed, all tests pass, code quality maintained

8. **webwakaagent3 - Write Documentation** (Week Z)
   - Task: Write [Module] module documentation
   - Deliverables: [MODULE]_DOCUMENTATION.md, GitHub commit in /documentation/, Checklist update
   - Success: Documentation complete and comprehensive, API documentation included, usage examples included

9. **webwaka007 - Validation Checkpoint Review** (Week Z)
   - Task: Review [Module] validation checkpoint
   - Deliverables: [MODULE]_VALIDATION_CHECKPOINT_DECISION.md, GitHub commit in /founder-agent-reviews/, Issue update, Checklist update
   - Success: All validation criteria reviewed, quality assessment provided, approval/feedback given, deployment authorized (if approved)

---

## REMAINING SUITES TO PROCESS

The following suites require execution prompt generation. Use the MASTER_IMPLEMENTATION_TASKS.md document to extract the exact task information for each:

### 1. HOSPITALITY SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** HOSPITALITY_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 2. CHURCH SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** CHURCH_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 3. HEALTH SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** HEALTH_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 4. EDUCATION SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** EDUCATION_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 5. PROJECT MANAGEMENT SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** PROJECT_MANAGEMENT_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 6. COMMUNITY SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** COMMUNITY_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 7. RIDE-HAILING SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** RIDE_HAILING_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 8. RIDESHARING SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** RIDESHARING_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 9. REAL ESTATE SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** REAL_ESTATE_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 10. RECRUITMENT SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** RECRUITMENT_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

### 11. CIVIC SUITE
- **Modules:** (Extract from MASTER_IMPLEMENTATION_TASKS.md)
- **Total Steps:** (Calculate based on module count × 9 steps per module)
- **File Name:** CIVIC_SUITE_EXECUTION_PROMPTS.md
- **Steps Range:** (Determine from MASTER_IMPLEMENTATION_TASKS.md)

---

## EXECUTION STEPS FOR WEBWAKA007

### Step 1: Extract Suite Information
For each remaining suite, extract from MASTER_IMPLEMENTATION_TASKS.md:
- Suite name and description
- Complete list of modules
- Exact task descriptions for each module
- Deliverables for each task type
- Success criteria for each task type

### Step 2: Calculate Step Numbers
- Determine the starting step number for the suite
- Calculate step numbers for each module (9 steps per module, except final modules which may have fewer)
- Verify no overlap with previously generated suites

### Step 3: Generate Prompts
For each module in the suite:
- Create 9 individual step prompts following the exact format
- Include all required reference documents
- Use correct agent assignments and PAT tokens
- Extract exact task descriptions from MASTER_IMPLEMENTATION_TASKS.md
- Include all deliverables and success criteria

### Step 4: Create Suite Summary Section
At the end of each file, include:
- Total steps count
- List of all modules with their step ranges
- Continuation pattern explanation
- Reference to next suite batch

### Step 5: Commit to Repository
For each generated file:
- Save to /home/ubuntu/research/[SUITE_NAME]_EXECUTION_PROMPTS.md
- Copy to /home/ubuntu/webwaka-governance/
- Commit with message: "feat: Add execution prompts for [Suite Name] suite"
- Push to origin master

### Step 6: Verification
After all suites are processed:
- Verify all files are committed to webwaka-governance
- Confirm no step number gaps exist
- Ensure all 14 suites plus shared primitives are covered
- Create summary document listing all generated files

---

## REFERENCE DOCUMENTS TO INCLUDE

Based on the suite type, include these reference documents in each prompt:

### Always Include:
1. MASTER_IMPLEMENTATION_TASKS.md
2. MODULE_SPECIFICATION_TEMPLATE.md (for specification steps)
3. WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md
4. NIGERIAN_FIRST_COMPLIANCE_CHECKLIST.md
5. MOBILE_FIRST_PWA_FIRST_TESTING_STRATEGY.md
6. AFRICA_FIRST_LOCALIZATION_STRATEGY.md

### For Review Steps:
- QUALITY_GATES_AND_RISK_MANAGEMENT.md

### For Validation Checkpoint Steps:
- VALIDATION_CHECKPOINT_PLAN.md

---

## IMPORTANT NOTES

1. **Consistency:** Every module must follow the exact 9-step pattern
2. **Accuracy:** Extract task descriptions directly from MASTER_IMPLEMENTATION_TASKS.md
3. **Completeness:** Include all deliverables and success criteria exactly as specified
4. **Format:** Follow the reference format document precisely
5. **Credentials:** Include correct PAT tokens for each agent
6. **Documentation:** Each file must have header with version, date, and status
7. **Confidentiality:** Mark all files as "DO NOT COMMIT TO GITHUB - CONTAINS CREDENTIALS"

---

## EXPECTED DELIVERABLES

Upon completion, you will have generated:

1. HOSPITALITY_SUITE_EXECUTION_PROMPTS.md
2. CHURCH_SUITE_EXECUTION_PROMPTS.md
3. HEALTH_SUITE_EXECUTION_PROMPTS.md
4. EDUCATION_SUITE_EXECUTION_PROMPTS.md
5. PROJECT_MANAGEMENT_SUITE_EXECUTION_PROMPTS.md
6. COMMUNITY_SUITE_EXECUTION_PROMPTS.md
7. RIDE_HAILING_SUITE_EXECUTION_PROMPTS.md
8. RIDESHARING_SUITE_EXECUTION_PROMPTS.md
9. REAL_ESTATE_SUITE_EXECUTION_PROMPTS.md
10. RECRUITMENT_SUITE_EXECUTION_PROMPTS.md
11. CIVIC_SUITE_EXECUTION_PROMPTS.md

All files will be committed to the webwaka-governance repository and available for agent execution.

---

## SUMMARY OF ALREADY GENERATED SUITES

The following execution prompt files have already been generated and committed:

1. **SHARED_PRIMITIVES_EXECUTION_PROMPTS.md** (80 steps)
   - Headless CMS, No-Code/Low-Code Builder, Payment & Billing System, User & Identity Management, Forms & Surveys, Analytics & Reporting, Community & Communication Platform, Booking & Scheduling Engine, Website & Page Builder

2. **SITES_AND_FUNNELS_SUITE_EXECUTION_PROMPTS.md** (45 steps)
   - Website Builder, Landing Page Creator, Form Builder, Email Marketing, Analytics

3. **POLITICS_SUITE_EXECUTION_PROMPTS.md** (77 steps)
   - Campaign Management, Voter Outreach, Donation Management, Volunteer Coordination, Event Management, Polling & Surveys, Media Management, Compliance & Reporting, Candidate Profile

4. **LOGISTICS_SUITE_EXECUTION_PROMPTS.md** (55 steps)
   - Warehouse Management, Route Optimization, Fleet Management, Delivery Tracking, Last-Mile Delivery, Supply Chain Analytics

---

## NEXT STEPS

1. Review this guidance document completely
2. Access MASTER_IMPLEMENTATION_TASKS.md from the webwaka-governance repository
3. Extract information for each remaining suite
4. Generate execution prompts following the exact format
5. Commit all files to webwaka-governance repository
6. Create final summary document of all generated prompts

Good luck! The platform implementation depends on these prompts being accurate and complete.
