# CAPABILITY REGISTRY STANDARD

**Document Type:** Governance Standard  
**Authority:** Founder-Mandated  
**Status:** RATIFIED  
**Version:** 1.1  
**Date:** 2026-02-22  
**Amendment:** ACDVA-01A — Added canonical agent reference linkage.

---

## 0. CANONICAL AGENT AUTHORITY

All `Owner` fields in this registry must reference agents defined in the canonical agent specification:

**`WEBWAKA_CANONICAL_AI_AGENT_ROLES_AUTHORITATIVE_SPECIFICATION.md`**

This document defines 44 canonical roles across 11 departments (10 operational + 1 Meta-Governance). No agent ID may be used as a capability owner unless it is registered in that specification. The Meta-Governance & Audit Agent (`webwaka007`) has read-only authority over this registry and may trigger a Governance Freeze if registry anomalies are detected.

---

## 1. PURPOSE

This document defines the authoritative standard for the WebWaka Capability Registry. The registry is the single source of truth for all platform capabilities, their ownership, interfaces, dependencies, and lifecycle state.

**The registry is not documentation. It is law.**

---

## 2. REGISTRY SCHEMA

Every capability in the WebWaka platform must be registered with the following mandatory fields:

### 2.1. Canonical Capability ID

**Format:** `{layer}.{category}.{name}`

**Examples:**
- `core.identity.user-auth`
- `capability.commerce.pos`
- `capability.mlas.economic-engine`
- `suite.hospitality.booking-engine`

**Rules:**
- Must be globally unique
- Must be immutable once assigned
- Must follow kebab-case naming
- Layer must be one of: `core`, `capability`, `suite`

### 2.2. Owner

**Definition:** The agent or team responsible for maintenance, support, and evolution.

**Format:** `{agent-id}` or `{team-name}`

**Examples:**
- `webwakaagent4` (Engineering & Delivery)
- `commerce-team`
- `hospitality-team`

**Validation:** All `{agent-id}` values must be registered in `WEBWAKA_CANONICAL_AI_AGENT_ROLES_AUTHORITATIVE_SPECIFICATION.md`.

**Responsibilities:**
- Interface design and evolution
- Bug fixes and incident response
- Breaking change management
- Documentation maintenance

### 2.3. Maturity Level

**Definition:** The stability and production-readiness of the capability.

**Allowed Values:**
- `experimental` — Under development, no stability guarantees
- `alpha` — Feature-complete but unstable, breaking changes expected
- `beta` — Stable interfaces, minor breaking changes possible
- `stable` — Production-ready, semantic versioning enforced
- `deprecated` — Scheduled for retirement, migration path provided
- `retired` — No longer supported, removed from platform

**Transition Rules:**
- `experimental` → `alpha`: Requires feature completeness
- `alpha` → `beta`: Requires 2+ consuming suites and 90% test coverage
- `beta` → `stable`: Requires ARB approval and 6-month stability window
- `stable` → `deprecated`: Requires Founder approval and migration plan
- `deprecated` → `retired`: Requires all dependents migrated

### 2.4. Public Interfaces

**Definition:** The contracts exposed by the capability for consumption by other capabilities or suites.

**Required Documentation:**
- API endpoints (REST, GraphQL, gRPC)
- Event schemas (published events)
- Database schemas (if shared)
- Configuration options
- Environment variables

**Format:** JSON Schema or OpenAPI 3.0

**Versioning:** All interfaces must be versioned using Semantic Versioning (SemVer).

### 2.5. Extension Points

**Definition:** The mechanisms by which the capability can be extended or customized without modification.

**Types:**
- **Hooks:** Pre/post execution hooks for business logic injection
- **Plugins:** Modular extensions that implement defined interfaces
- **Configuration:** Runtime behavior modification via configuration
- **Events:** Event-driven integration points

**Required Documentation:**
- Extension point name and purpose
- Input/output contracts
- Execution guarantees
- Performance impact

### 2.6. Downstream Dependents

**Definition:** The capabilities and suites that depend on this capability.

**Format:** Array of capability IDs

**Purpose:**
- Impact analysis for breaking changes
- Deprecation planning
- Incident communication

**Maintenance:** Automatically updated by CI during build process.

### 2.7. Lifecycle State

**Definition:** The operational status of the capability.

**Allowed Values:**
- `active` — Currently in use and supported
- `frozen` — No new features, only critical bug fixes
- `migrating` — Being replaced by another capability
- `sunset` — Scheduled for removal, migration window active

**Transition Rules:**
- `active` → `frozen`: Requires owner approval
- `active` → `migrating`: Requires ARB approval and replacement capability ID
- `frozen` → `sunset`: Requires Founder approval
- `migrating` → `retired`: Requires all dependents migrated

### 2.8. Approval Authority

**Definition:** The governance body required to approve changes to this capability.

**Allowed Values:**
- `owner` — Owner can approve (non-breaking changes only)
- `arb` — Architecture Review Board approval required
- `founder` — Founder approval required (core infrastructure only)

**Rules:**
- Breaking changes always require ARB approval minimum
- Core infrastructure changes require Founder approval
- Suite-specific changes require only owner approval

---

## 3. REGISTRY STRUCTURE

The registry is maintained as a structured JSON file at:

```
/docs/governance/capability-registry.json
```

### 3.1. Schema

```json
{
  "version": "1.0",
  "last_updated": "2026-02-15T12:00:00Z",
  "capabilities": {
    "core.identity.user-auth": {
      "id": "core.identity.user-auth",
      "owner": "webwakaagent4",
      "maturity": "stable",
      "lifecycle": "active",
      "approval_authority": "founder",
      "repository": "webwaka-platform-core",
      "path": "/src/core/identity",
      "version": "2.1.0",
      "public_interfaces": {
        "rest_api": "/api/v1/auth",
        "events": ["user.authenticated", "user.logout"],
        "schema": "https://schema.webwaka.com/identity/v2"
      },
      "extension_points": [
        {
          "name": "pre_auth_hook",
          "type": "hook",
          "contract": "https://schema.webwaka.com/hooks/pre-auth"
        }
      ],
      "downstream_dependents": [
        "capability.commerce.pos",
        "suite.hospitality.booking-engine"
      ],
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2026-02-15T12:00:00Z"
    }
  }
}
```

---

## 4. REGISTRY OPERATIONS

### 4.1. Adding a New Capability

**Process:**
1. Propose capability to ARB with justification
2. ARB assigns canonical ID
3. Owner creates registry entry with `maturity: experimental`
4. CI validates schema compliance
5. PR merged after ARB approval

**Required Artifacts:**
- Capability proposal document
- Interface specifications
- Test coverage plan
- Migration impact analysis (if replacing existing logic)

### 4.2. Updating a Capability

**Process:**
1. Owner proposes change via PR
2. CI validates schema compliance
3. CI checks approval authority requirement
4. ARB reviews if required
5. PR merged after appropriate approval

**Breaking Changes:**
- Must increment major version
- Must provide migration guide
- Must notify all downstream dependents
- Must maintain backward compatibility for 1 release cycle

### 4.3. Deprecating a Capability

**Process:**
1. Owner proposes deprecation with replacement plan
2. ARB reviews and approves
3. Maturity set to `deprecated`
4. Lifecycle set to `sunset`
5. Sunset date assigned (minimum 6 months)
6. All dependents notified
7. Migration support provided
8. After sunset date, capability retired

---

## 5. ENFORCEMENT

### 5.1. CI Validation

Every PR must pass registry validation:

```bash
# Validate registry schema
npm run validate-registry

# Check for duplicate capability IDs
npm run check-duplicates

# Verify approval authority
npm run check-approvals

# Update downstream dependents
npm run update-dependents
```

### 5.2. PR Template Requirements

All PRs that modify capabilities must include:

```markdown
## Capability Registry Impact

- [ ] Capability ID: `{id}`
- [ ] Owner: `{owner}`
- [ ] Maturity: `{maturity}`
- [ ] Breaking Change: Yes/No
- [ ] Downstream Dependents Notified: Yes/No/N/A
- [ ] ARB Approval Link: {url}
```

### 5.3. Automated Compliance

Daily automated scan checks:
- All capabilities have valid registry entries
- No orphan code exists outside registered capabilities
- All dependents are accurately tracked
- No duplicate capability IDs exist

---

## 6. CONFLICT RESOLUTION

### 6.1. Duplicate Detection

**Triggers:**
- Two capabilities with overlapping functionality
- Similar naming patterns
- Overlapping interface contracts

**Detection Method:**
- Automated semantic analysis of capability descriptions
- Manual ARB review during quarterly audits

### 6.2. Canonical Winner Selection

**Criteria (in order of priority):**
1. Maturity level (stable > beta > alpha > experimental)
2. Number of downstream dependents
3. Test coverage percentage
4. Documentation completeness
5. Owner capacity and commitment

**Process:**
1. ARB identifies conflict
2. ARB evaluates both capabilities against criteria
3. ARB selects canonical winner
4. Losing capability marked as `deprecated`
5. Migration plan created
6. Dependents notified and migrated

### 6.3. Deprecation Handling

**Timeline:**
- **T+0:** Capability marked `deprecated`, announcement sent
- **T+1 month:** Migration guide published
- **T+3 months:** Migration support provided
- **T+6 months:** Capability marked `retired`, removed from platform

---

## 7. ACCEPTANCE CRITERIA

**Question:** "What prevents someone tomorrow from rebuilding donations inside another suite?"

**Answer:**

1. **Registry Law:** Donations capability is registered as `capability.fundraising.donations` owned by `fundraising-team`
2. **CI Rule:** Any PR adding donation logic to a suite folder triggers CI failure with message: "Donation logic detected. Must use `capability.fundraising.donations`"
3. **PR Template:** PR template requires capability ID reference. Missing reference = auto-reject
4. **ARB Gate:** New capability proposals reviewed by ARB. Duplicate detection prevents approval

**Result:** Mechanical prevention at 4 layers. Human discipline not required.

---

## END OF STANDARD
