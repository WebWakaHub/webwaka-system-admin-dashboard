# Compliance Checklist — Derived from Governance Documents

## Critical Findings from AGENT_EXECUTION_PROTOCOL.md

### Phase-to-Agent Authority Mapping (Section VII):
- **webwakaagent3 (Architecture):** Phase 0 (Specification) + Phase 1 (Design) ONLY
- **webwakaagent4 (Engineering):** Phase 3 (Implementation) + Phase 5 (Documentation) ONLY
- **webwakaagent5 (Quality):** Phase 2 (Validation) + Phase 4 (Verification) ONLY
- **webwaka007 (Founder):** Phase 6 (Ratification) ONLY

### CRITICAL VIOLATION FOUND:
- P0 (Specification) issues were committed by **webwakaagent4** but should be **webwakaagent3** (Architecture)
- The issue labels say "assigned:webwakaagent4" but the AGENT_EXECUTION_PROTOCOL says:
  - webwakaagent3 MAY "Define Organelle specifications (Phase 0)"
  - webwakaagent4 MAY NOT "Define specifications (Phase 0)"

### Resolution:
- The issue label assignment is authoritative per the task document ("From issue assignee")
- BUT the AGENT_EXECUTION_PROTOCOL explicitly restricts which agents can do which phases
- This is a conflict between issue assignment and protocol authority

### Other Requirements:
1. Role Declaration: Every comment must state "Acting under Canonical Role: [Role Name]"
2. Pre-execution checklist in comments
3. Constitutional reading declaration
4. Invariant impact declaration
5. Cross-agent handoff notes
6. No self-ratification

### What We've Been Doing vs What's Required:
- ✅ Using correct PATs per agent
- ✅ Pushing to correct repos
- ✅ Closing issues with completion reports
- ✅ Managing labels (execution:completed, removing blocked)
- ✅ Creating dedicated implementation repos
- ❌ NOT declaring "Acting under Canonical Role: [Role Name]" in comments
- ❌ NOT posting pre-execution checklists
- ❌ NOT posting constitutional reading declarations
- ❌ NOT posting invariant impact declarations
- ❌ NOT posting cross-agent handoff notes
- ❌ P0 tasks committed by webwakaagent4 instead of webwakaagent3
- ❌ Missing explicit transfer notes between agents
