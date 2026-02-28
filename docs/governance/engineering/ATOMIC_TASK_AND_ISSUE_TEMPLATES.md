_# Atomic Task & Issue Templates_

**Document Type:** Policy  
**Department:** Engineering & Delivery  
**Owning Agent:** webwakaagent4  
**Status:** Final Draft  
**Authority:** FD-2026-001, FD-2026-002  
**Related Founder Decisions:** FD-2026-001, FD-2026-002  
**Version:** v2.0  
**Last Updated:** 2026-02-04

---

## 1. Purpose

This document provides templates for creating atomic tasks and issues within the WebWakaHub issue tracking system. The purpose of these templates is to ensure that all tasks and issues are created with a consistent and complete set of information, enabling efficient and effective development.

## 2. Canonical Context

These templates are established under the authority of FD-2026-001 and FD-2026-002 and are an integral part of the engineering and delivery process. They are designed to be used in conjunction with the **Definition of Ready (DoR)** and **Definition of Done (DoD)**.

## 3. Field Reality Considerations (MANDATORY)

All issues and tasks must include a section for "Field Reality Considerations" to ensure that the following realities of our target market are addressed:

- **Nigeria-first, Africa-first:** How does this task account for the specific infrastructure, user behaviors, and market dynamics of Nigeria and the broader African continent?
- **Mobile-first:** How will this task be validated on mobile devices?
- **PWA-first:** How does this task contribute to a reliable, fast, and engaging Progressive Web App (PWA) experience?
- **Offline-first:** How will this task function with intermittent or no internet connectivity?

## 4. Issue Templates

### Bug Report

```markdown
**Title:** [Bug] A brief, descriptive title

**Description:**
A clear and concise description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior:**
A clear and concise description of what you expected to happen.

**Actual Behavior:**
A clear and concise description of what actually happened.

**Screenshots:**
If applicable, add screenshots to help explain your problem.

**Field Reality Considerations:**
- Nigeria-first, Africa-first:
- Mobile-first:
- PWA-first:
- Offline-first:

**Additional Context:**
Add any other context about the problem here.
```

### Feature Request

```markdown
**Title:** [Feature] A brief, descriptive title

**Description:**
A clear and concise description of the feature.

**User Story:**
As a [type of user], I want [an action] so that [a benefit].

**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

**Field Reality Considerations:**
- Nigeria-first, Africa-first:
- Mobile-first:
- PWA-first:
- Offline-first:

**Additional Context:**
Add any other context or screenshots about the feature request here.
```

### Technical Task

```markdown
**Title:** [Task] A brief, descriptive title

**Description:**
A clear and concise description of the technical task.

**Scope:**
A clear and concise description of the scope of the task.

**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

**Field Reality Considerations:**
- Nigeria-first, Africa-first:
- Mobile-first:
- PWA-first:
- Offline-first:

**Additional Context:**
Add any other context about the task here.
```

## 5. Enforcement

These templates will be integrated into the issue tracking system to ensure that all new issues are created using the appropriate format, in accordance with the **Definition of Ready (DoR)**.

## 6. References

- FD-2026-001: Governance Foundation & Authority Model for WebWakaHub
- FD-2026-002: Mandatory Agent Checklist & Execution Visibility Rule
- Definition of Ready (DoR) (engineering/DEFINITION_OF_READY.md)
- Definition of Done (DoD) (engineering/DEFINITION_OF_DONE.md)
