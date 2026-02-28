# Universal Agent Bootstrap Prompt Template

**Version:** 1.0  
**Date:** 2026-02-05  
**Status:** Canonical & Binding  
**Authority:** Founder-Mandated Institutional Law

---

## Purpose

This document contains the **universal bootstrap prompt template** for activating any WebWaka agent.

**Key Benefits:**
- **Ultra-simple:** Only 4 lines needed to activate any agent
- **No context duplication:** All identity context lives in the Agent Identity Registry
- **Prevents identity drift:** Single source of truth for agent identity
- **Instant onboarding:** Agent can be activated in seconds
- **Scales cleanly:** Same prompt works for all agents and all phases

---

## The Universal Bootstrap Prompt

```
You are <AGENT_ID>.

Here is your GitHub PAT: <GITHUB_PAT>

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, and begin execution.
```

---

## How to Use This Template

### Step 1: Replace Variables
- `<AGENT_ID>`: Replace with agent identifier:
  - For execution agents: `webwakaagent1`, `webwakaagent2`, ..., `webwakaagent10`
  - For Founder Agent: `founder_agent`
- `<GITHUB_PAT>`: Replace with the GitHub Personal Access Token for that agent

### Step 2: Send Prompt to Agent
- Copy the prompt with variables replaced
- Send to Manus AI agent
- Agent will automatically:
  1. Identify itself
  2. Load the Agent Identity Registry
  3. Find its identity section
  4. Internalize all authority boundaries, responsibilities, and governance rules
  5. Load all required documents
  6. Begin execution

### Step 3: No Further Context Needed
- Do NOT add additional context
- Do NOT add platform details
- Do NOT add role descriptions
- Everything the agent needs is in the registry

---

## Example: Activating webwakaagent1 (Chief of Staff)

```
You are webwakaagent1.

Here is your GitHub PAT: [REDACTED-PAT]

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, and begin execution.
```

**That's it.** The agent will:
1. Recognize it is webwakaagent1 (Chief of Staff)
2. Load the Agent Identity Registry
3. Read the webwakaagent1 section completely
4. Load all 15 required governance documents
5. Understand its authority boundaries
6. Begin coordinating Phase 1 execution

---

## Example: Activating founder_agent (Founder Agent)

```
You are founder_agent.

Here is your GitHub PAT: [REDACTED-PAT]

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, and begin execution.
```

**That's it.** The agent will:
1. Recognize it is founder_agent (Delegated Authority Agent)
2. Load the Agent Identity Registry
3. Read the founder_agent section completely (SPECIAL AUTHORITY CLASS)
4. Load all 15 required governance documents (including 4 Founder Agent-specific docs)
5. Understand its delegated authority boundaries and operating modes
6. Begin acting on behalf of Founder within delegated scope

**Note:** The Founder Agent is NOT an execution agent. It is a special authority class that acts on behalf of the human Founder within explicitly delegated authority.

---

## Example: Activating webwakaagent4 (Engineering & Delivery)

```
You are webwakaagent4.

Here is your GitHub PAT: [REDACTED-PAT]

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, and begin execution.
```

**That's it.** The agent will:
1. Recognize it is webwakaagent4 (Backend Engineering Agent)
2. Load the Agent Identity Registry
3. Read the webwakaagent4 section completely
4. Load all 10 required governance documents
5. Understand its authority boundaries (MAY implement code, MAY NOT make architecture decisions)
6. Begin engineering and delivery work

---

## What Happens After Bootstrap

### Immediate Actions (Automatic)
1. Agent identifies itself from the prompt
2. Agent accesses the Agent Identity Registry using the provided GitHub PAT
3. Agent locates its identity section (webwakaagent1 through webwakaagent10)
4. Agent reads and internalizes:
   - Department and primary role
   - Mission statement
   - Authority scope (I MAY)
   - Prohibited actions (I MAY NOT)
   - Required documents to always load
   - Governance obligations
   - Escalation path
   - Phase 1 document responsibilities
   - Behavior when context is missing

### Document Loading (Automatic)
5. Agent loads all required documents listed in "Required Documents to Always Load"
6. Agent confirms understanding of governance rules
7. Agent confirms understanding of Phase 1 scope limitations

### Execution Begins (Automatic)
8. Agent begins execution within its defined authority boundaries
9. Agent maintains checklist per FD-2026-002
10. Agent escalates to Chief of Staff when needed
11. Agent operates until explicitly told otherwise

---

## Standing Rules

### For All Agent Activations
1. **Always use this bootstrap prompt** - No exceptions
2. **Never add additional context** - Everything is in the registry
3. **Never modify the prompt structure** - Only replace variables
4. **Always provide valid GitHub PAT** - Agent needs repository access

### For Agent Identity Changes
1. **Agent identity persists** - Agent continues operating under assigned identity until explicitly told otherwise
2. **No identity drift** - Agent must not assume different roles or authorities
3. **Explicit reassignment only** - Only Founder can reassign agent identity via new bootstrap prompt

### For Registry Updates
1. **Registry is single source of truth** - All agents reference the same registry
2. **Registry updates apply immediately** - Agents re-read registry when instructed
3. **Only Founder can update registry** - Via Founder Decision

---

## Comparison: Before vs. After

### Before (Long Contextual Prompts)
```
You are webwakaagent3, the Architecture & System Design agent for WebWaka.

Your role is to design the technical architecture for the WebWaka platform, 
ensuring architectural decisions align with offline-first, event-driven, 
modular, and real-time requirements while balancing technical excellence 
with field reality constraints.

You are authorized to:
- Design core platform architecture
- Define system design patterns
- Specify event-driven architecture
[... 50+ more lines of context ...]

You must read the following documents:
- FD-2026-001_NEW_UNIVERSE.md
- FD-2026-002_MANDATORY_AGENT_CHECKLIST.md
[... 15+ more documents ...]

Your Phase 1 responsibilities include:
1. Core Platform Architecture Document
2. Event-Driven Architecture Specification
[... 10+ more documents ...]

[... 100+ more lines of governance rules, escalation paths, etc. ...]
```

**Problems:**
- ❌ 200+ lines of context
- ❌ Context duplication across agents
- ❌ Risk of identity drift (outdated prompts)
- ❌ Difficult to maintain consistency
- ❌ Slow onboarding

### After (Universal Bootstrap Prompt)
```
You are webwakaagent3.

Here is your GitHub PAT: [REDACTED-PAT]

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, and begin execution.
```

**Benefits:**
- ✅ 4 lines total
- ✅ No context duplication
- ✅ No identity drift (single source of truth)
- ✅ Easy to maintain consistency
- ✅ Instant onboarding

---

## Troubleshooting

### Agent Cannot Access Registry
**Problem:** Agent reports it cannot access the Agent Identity Registry  
**Solution:** Verify the GitHub PAT is valid and has read access to the webwaka-governance repository

### Agent Cannot Find Its Identity
**Problem:** Agent reports it cannot find its identity in the registry  
**Solution:** Verify the agent ID is correct (webwakaagent1 through webwakaagent10)

### Agent Asks for Additional Context
**Problem:** Agent asks for role details, authority boundaries, or other context  
**Solution:** Direct agent to re-read its identity section in the Agent Identity Registry

### Agent Operates Outside Authority Boundaries
**Problem:** Agent attempts actions outside its authority scope  
**Solution:** Escalate to Chief of Staff (webwakaagent1) for governance enforcement

---

## Version History

- **v1.0 (2026-02-05):** Initial template created per Founder directive

---

## Related Documents

- **AGENT_IDENTITY_REGISTRY.md** - Single source of truth for agent identities
- **FD-2026-001_NEW_UNIVERSE.md** - Governance Foundation & Authority Model
- **FD-2026-002_MANDATORY_AGENT_CHECKLIST.md** - Mandatory Agent Checklist & Execution Visibility Rule
- **WEBWAKA_CANONICAL_AI_AGENT_ROLES_AUTHORITATIVE_SPECIFICATION.md** - 43 canonical roles

---

**Document Type:** Universal Bootstrap Prompt Template  
**Authority:** Founder-Mandated Institutional Law  
**Status:** Canonical & Binding  
**Maintenance:** Founder Decision Only
