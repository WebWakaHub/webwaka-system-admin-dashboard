# Post-Incident Review Template

**Document Type:** Template  
**Department:** Release, Operations & Support  
**Owning Agent:** webwakaagent6  
**Status:** Draft  
**Authority:** FD-2026-001 (Governance Foundation)  
**Related Founder Decisions:** FD-2026-001  
**Version:** v1.0  
**Last Updated:** 2026-02-04

---

## Zero-Based Governance Context

This document is part of the WebWakaHub zero-based governance restart initiated under FD-2026-001.

No prior post-incident review procedures carry binding authority unless explicitly re-ratified under this governance model.

---

## Nigeria-First, Africa-First, Mobile-First Compliance

**All post-incident reviews must explicitly consider Nigeria-first, Africa-first, mobile-first, PWA-first, and offline-first realities:**

### Mobile-First & Low-Bandwidth Incident Analysis

**Post-incident reviews must analyze:**
- Impact on users on 2G/3G networks
- Impact on low-end device users
- Impact on offline users
- PWA offline caching impact on incident visibility
- Bandwidth implications of incident and recovery

### Nigeria-First & Africa-First Incident Learning

**Post-incident reviews must prioritize:**
- Nigeria-specific incident impact assessment
- Africa-wide infrastructure lessons learned
- Regional payment method incident patterns
- Local language communication effectiveness
- Regional compliance incident implications

### Offline-First Incident Lessons

**Post-incident reviews must examine:**
- Offline user impact and recovery
- Offline transaction reconciliation issues
- Offline identity and authorization issues
- Deterministic sync failures
- Offline-first feature incident patterns

---

## Purpose & Scope

**Purpose:**  
This template provides a standardized format for conducting post-incident reviews (also called postmortems or retrospectives). Post-incident reviews ensure that lessons are learned from incidents and preventive measures are implemented to prevent recurrence.

**Scope:**  
This template applies to:
- All Severity 1 (Critical) incidents
- All Severity 2 (High) incidents affecting customers
- All security incidents
- All incidents with significant impact
- Any incident deemed worthy of review by incident commander

**What this template does NOT cover:**
- Incident response procedures (see Incident Response Runbooks)
- Rollback procedures (see Rollback & Recovery Playbooks)
- General operational procedures (see Operations Procedures Document)
- Monitoring and alerting (see Monitoring & Observability Plan)

---

## Post-Incident Review Process

### Phase 1: Preparation

**Timeline:** Within 24 hours of incident resolution

**Activities:**

1. **Schedule Review Meeting**
   - Schedule within 1-3 business days of incident
   - Allow time for initial investigation
   - Invite all team members involved
   - Provide meeting link and calendar invite

2. **Gather Initial Information**
   - Collect incident logs and monitoring data
   - Compile timeline of events
   - Document all actions taken
   - Gather customer impact information

3. **Prepare Draft Summary**
   - Create initial incident summary
   - Document what happened
   - Note immediate actions taken
   - Identify preliminary root cause

4. **Notify Participants**
   - Send meeting invitation with details
   - Provide pre-reading materials
   - Request any additional information
   - Set expectations for discussion

### Phase 2: Review Meeting

**Timeline:** 1-3 business days after incident

**Participants:**
- Incident Commander
- All team members involved in incident response
- Technical leads from affected teams
- Support team representative
- Optionally: Customer representative (for major incidents)

**Duration:** 60-90 minutes

**Agenda:**

1. **Incident Overview** (10 minutes)
   - Incident commander presents incident summary
   - Timeline of events
   - Impact on users and systems

2. **Root Cause Analysis** (20 minutes)
   - Technical investigation findings
   - Root cause identification
   - Contributing factors
   - Why it wasn't caught earlier

3. **Response Actions** (15 minutes)
   - Actions taken during incident
   - What worked well
   - What could be improved
   - Timeline of response

4. **Lessons Learned** (20 minutes)
   - What we learned
   - What we'll do differently
   - Process improvements
   - Technology improvements

5. **Action Items** (15 minutes)
   - Identify preventive measures
   - Assign owners and deadlines
   - Prioritize by impact and effort
   - Commit to implementation

### Phase 3: Documentation

**Timeline:** Within 1 week of review meeting

**Activities:**

1. **Document Findings**
   - Record all discussion points
   - Document root cause analysis
   - Document lessons learned
   - Document action items

2. **Create Action Items**
   - Create tickets for each action item
   - Assign owners and deadlines
   - Link to post-incident review
   - Set priority levels

3. **Distribute Report**
   - Share post-incident review with team
   - Distribute to stakeholders
   - Archive in knowledge base
   - Notify customers (if applicable)

4. **Track Implementation**
   - Monitor action item progress
   - Follow up on overdue items
   - Verify completion
   - Document lessons learned

---

## Post-Incident Review Template

### Incident Summary

**Incident ID:** [Generated ID]  
**Incident Title:** [Brief description]  
**Incident Date:** [Date and time]  
**Severity:** [Critical/High/Medium/Low]  
**Duration:** [Start time to end time]  
**Customers Affected:** [Number of customers]  
**Users Affected:** [Number of users]

### Timeline of Events

| Time | Event | Owner |
|------|-------|-------|
| [HH:MM] | [Event description] | [Team/Person] |
| [HH:MM] | [Event description] | [Team/Person] |
| [HH:MM] | [Event description] | [Team/Person] |

### Impact Assessment

**User Impact:**
- Number of users affected: [Number]
- Percentage of user base: [Percentage]
- Duration of impact: [Duration]
- Features affected: [List of features]
- Data loss: [Yes/No - if yes, describe]

**Business Impact:**
- Revenue impact: [Estimated amount or N/A]
- Customer satisfaction impact: [High/Medium/Low]
- Brand impact: [High/Medium/Low]
- SLA/SLO impact: [Yes/No - if yes, describe]

**Operational Impact:**
- Team hours spent: [Number of hours]
- Systems affected: [List of systems]
- Data affected: [Yes/No - if yes, describe]
- Escalations: [Yes/No - if yes, describe]

### Root Cause Analysis

**Primary Root Cause:**

[Describe the fundamental cause of the incident]

**Contributing Factors:**

1. [Contributing factor 1]
2. [Contributing factor 2]
3. [Contributing factor 3]

**Why Wasn't It Caught Earlier?**

[Describe why existing monitoring, testing, or procedures didn't catch this]

### Response Actions

**What Worked Well:**

1. [Positive aspect of response]
2. [Positive aspect of response]
3. [Positive aspect of response]

**What Could Be Improved:**

1. [Area for improvement]
2. [Area for improvement]
3. [Area for improvement]

**Response Timeline:**

| Time | Action | Owner | Result |
|------|--------|-------|--------|
| [HH:MM] | [Action taken] | [Team/Person] | [Result] |
| [HH:MM] | [Action taken] | [Team/Person] | [Result] |
| [HH:MM] | [Action taken] | [Team/Person] | [Result] |

### Lessons Learned

**What We Learned:**

1. [Lesson 1]
2. [Lesson 2]
3. [Lesson 3]

**What We'll Do Differently:**

1. [Change 1]
2. [Change 2]
3. [Change 3]

**Process Improvements:**

1. [Process improvement 1]
2. [Process improvement 2]
3. [Process improvement 3]

**Technology Improvements:**

1. [Technology improvement 1]
2. [Technology improvement 2]
3. [Technology improvement 3]

### Action Items

| ID | Action Item | Owner | Priority | Deadline | Status |
|----|----|-------|----------|----------|--------|
| [ID] | [Action description] | [Owner] | [High/Medium/Low] | [Date] | [Status] |
| [ID] | [Action description] | [Owner] | [High/Medium/Low] | [Date] | [Status] |
| [ID] | [Action description] | [Owner] | [High/Medium/Low] | [Date] | [Status] |

**Action Item Priorities:**

- **High Priority:** Must be completed within 2 weeks
- **Medium Priority:** Should be completed within 1 month
- **Low Priority:** Should be completed within 3 months

### Preventive Measures

**To Prevent This Incident in the Future:**

1. **Monitoring & Alerting**
   - [Add monitoring for this condition]
   - [Add alert to notify team]
   - [Set alert thresholds]

2. **Testing & Validation**
   - [Add test case to catch this]
   - [Add integration test]
   - [Add performance test]

3. **Process Changes**
   - [Change to process]
   - [Change to procedure]
   - [Change to approval workflow]

4. **Technology Changes**
   - [Technology change]
   - [Architecture change]
   - [Tool or platform change]

5. **Documentation & Training**
   - [Documentation update]
   - [Training for team]
   - [Runbook update]

### Stakeholder Communication

**Customer Communication:**

[Describe how customers were notified and what they were told]

**Internal Communication:**

[Describe how internal teams were notified and kept updated]

**Post-Incident Communication:**

[Describe follow-up communication with customers and stakeholders]

### Metrics & Analysis

**Incident Metrics:**

| Metric | Value |
|--------|-------|
| Time to Detect | [Duration] |
| Time to Respond | [Duration] |
| Time to Mitigate | [Duration] |
| Time to Resolve | [Duration] |
| Total Duration | [Duration] |

**Team Metrics:**

| Metric | Value |
|--------|-------|
| Team Members Involved | [Number] |
| Team Hours Spent | [Number] |
| Teams Involved | [List] |
| Escalations | [Number] |

**Comparison to Baseline:**

| Metric | This Incident | Average | Variance |
|--------|---|---|---|
| Time to Detect | [Duration] | [Duration] | [+/- %] |
| Time to Respond | [Duration] | [Duration] | [+/- %] |
| Time to Resolve | [Duration] | [Duration] | [+/- %] |

### Review Meeting Details

**Meeting Date:** [Date]  
**Meeting Duration:** [Duration]  
**Participants:** [List of participants]  
**Facilitator:** [Name]  
**Scribe:** [Name]

**Discussion Highlights:**

[Summary of key discussion points]

**Decisions Made:**

[Any decisions made during review]

**Open Questions:**

[Any questions that need follow-up]

---

## Post-Incident Review Best Practices

### Creating a Blameless Culture

**Post-incident reviews should focus on:**
- Understanding what happened
- Learning from the incident
- Improving processes and systems
- NOT blaming individuals

**Key principles:**
- Assume good intent
- Focus on systems, not people
- Treat as learning opportunity
- Encourage open discussion
- Protect confidentiality

### Effective Root Cause Analysis

**Use the "5 Whys" technique:**

1. Why did the incident occur?
2. Why did that cause occur?
3. Why did that cause occur?
4. Why did that cause occur?
5. Why did that cause occur?

**Stop when you reach:**
- A systemic issue (not a person)
- A preventable condition
- An actionable recommendation

### Action Item Tracking

**Action items should be:**
- Specific and measurable
- Assigned to a single owner
- Given a realistic deadline
- Tracked to completion
- Verified as effective

**Action item lifecycle:**
1. Created during review
2. Assigned to owner
3. Tracked in system
4. Completed by deadline
5. Verified as complete
6. Effectiveness measured

---

## Compliance & Governance

**This template complies with:**
- FD-2026-001 (Governance Foundation)
- Incident response procedures
- Learning and improvement principles
- Phase-locked execution doctrine

**This template is enforced through:**
- Incident response procedures
- Post-incident review process
- Action item tracking
- Chief of Staff oversight

---

## Authority & Escalation

**Incident Commander Authority:**
- Conduct post-incident review
- Facilitate discussion
- Assign action items
- Escalate findings to Chief of Staff

**Escalation Path:**
- Incident Commander → Chief of Staff (for systemic issues)
- Chief of Staff → Founder (for material decisions)

---

## Document Status

**Status:** DRAFT  
**Next Steps:**
- Coordinate with all departments on post-incident review procedures
- Establish action item tracking system
- Define review meeting procedures
- Submit for Chief of Staff review and approval
- Finalize and lock for Phase 1 completion

**Approval Required From:**
- webwakaagent1 (Chief of Staff)
- webwakaagent10 (Research & Future Exploration)

---

**Document Owner:** webwakaagent6 (Release Manager)  
**Department:** Release, Operations & Support  
**Authority:** FD-2026-001  
**Version:** v1.0  
**Status:** DRAFT - READY FOR STAKEHOLDER REVIEW
