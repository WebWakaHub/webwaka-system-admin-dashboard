#!/usr/bin/env python3
"""
COMPREHENSIVE ORGANELLE-UNIVERSE AUDIT
Deep audit of all issues: state, lifecycle, agent assignments, deliverables
"""
import json
import os
import sys
from collections import defaultdict

# Load all issues
all_issues = []
for page in range(1, 12):
    fpath = f"/tmp/issues_page_{page}.json"
    if not os.path.exists(fpath):
        break
    with open(fpath) as f:
        data = json.load(f)
    if not isinstance(data, list) or len(data) == 0:
        break
    all_issues.extend(data)

print(f"Total issues loaded: {len(all_issues)}")

# Separate PRs from issues (GitHub API includes PRs in issues endpoint)
issues_only = [i for i in all_issues if 'pull_request' not in i]
prs_only = [i for i in all_issues if 'pull_request' in i]
print(f"Issues (non-PR): {len(issues_only)}")
print(f"Pull Requests: {len(prs_only)}")

# Count by state
open_issues = [i for i in issues_only if i['state'] == 'open']
closed_issues = [i for i in issues_only if i['state'] == 'closed']
print(f"\nOpen issues: {len(open_issues)}")
print(f"Closed issues: {len(closed_issues)}")

# Categorize issues by labels
def get_labels(issue):
    return [l['name'] for l in issue.get('labels', [])]

def get_assignees(issue):
    return [a['login'] for a in issue.get('assignees', [])]

def get_milestone(issue):
    m = issue.get('milestone')
    return m['title'] if m else 'None'

# Build detailed report
report = []
report.append("=" * 100)
report.append("ORGANELLE-UNIVERSE COMPREHENSIVE AUDIT REPORT")
report.append("=" * 100)
report.append(f"\nTotal Issues: {len(issues_only)}")
report.append(f"Open: {len(open_issues)}")
report.append(f"Closed: {len(closed_issues)}")

# ============================================================
# SECTION 1: List ALL open issues with details
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 1: ALL OPEN ISSUES (SHOULD BE ZERO FOR COMPLETED ORGANELLES)")
report.append("=" * 80)

if open_issues:
    for i in sorted(open_issues, key=lambda x: x['number']):
        labels = get_labels(i)
        assignees = get_assignees(i)
        milestone = get_milestone(i)
        report.append(f"\n  #{i['number']} [{i['state']}] {i['title']}")
        report.append(f"    Labels: {', '.join(labels) if labels else 'NONE'}")
        report.append(f"    Assignees: {', '.join(assignees) if assignees else 'NONE'}")
        report.append(f"    Milestone: {milestone}")
else:
    report.append("\n  No open issues found.")

# ============================================================
# SECTION 2: Group issues by organelle component
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 2: ISSUES GROUPED BY ORGANELLE COMPONENT")
report.append("=" * 80)

# Identify organelle components from issue titles
# Pattern: titles contain organelle identifiers like ORG-IN, ORG-EI, ORGN-AI, etc.
components = defaultdict(list)
unclassified = []

for i in issues_only:
    title = i['title']
    # Try to extract component from title
    classified = False
    
    # Known organelle patterns
    patterns = [
        'INSTRUMENTATION_PROBE', 'EXTERNAL_ADAPTER', 'RESULT_VALIDATOR', 'AUDIT_EMITTER',
        'COGNITIVE_PORT', 'PROMPT_ASSEMBLER',
        'EVENT_DISPATCHER', 'MESSAGE_GATEWAY', 'TELEMETRY_COLLECTOR',
        'DISCOVERY_REGISTRY', 'GOVERNANCE_REGISTRY', 'SUBJECT_REGISTRY',
        'POLICY_DEFINITION', 'TRUST_ASSERTION', 'VALIDATION_ENGINE',
        'COMPOSITION_MODELER', 'RESOURCE_ALLOCATOR', 'SCHEDULER_EXECUTOR',
        'WORKFLOW_ORCHESTRATOR', 'RECORD_STORE', 'AUDIT_LOGGER'
    ]
    
    for pat in patterns:
        if pat in title.upper().replace('-', '_').replace(' ', '_'):
            components[pat].append(i)
            classified = True
            break
    
    if not classified:
        # Try label-based classification
        for l in get_labels(i):
            for pat in patterns:
                if pat.lower().replace('_', '-') in l.lower() or pat.lower() in l.lower():
                    components[pat].append(i)
                    classified = True
                    break
            if classified:
                break
    
    if not classified:
        unclassified.append(i)

for comp in sorted(components.keys()):
    issues = components[comp]
    open_count = sum(1 for i in issues if i['state'] == 'open')
    closed_count = sum(1 for i in issues if i['state'] == 'closed')
    report.append(f"\n  {comp}: {len(issues)} issues (Open: {open_count}, Closed: {closed_count})")
    
    # Check lifecycle completeness
    master_issues = [i for i in issues if 'master' in i['title'].lower() or 'MASTER' in i['title']]
    phase_issues = [i for i in issues if any(p in i['title'] for p in ['[P0]', '[P1]', '[P2]', '[P3]', '[P4]', '[P5]', '[P6]'])]
    task_issues = [i for i in issues if any(t in i['title'] for t in ['T01', 'T02', 'T03'])]
    
    report.append(f"    Master issues: {len(master_issues)}")
    report.append(f"    Phase issues: {len(phase_issues)}")
    report.append(f"    Task issues: {len(task_issues)}")
    
    # List any open issues
    open_in_comp = [i for i in issues if i['state'] == 'open']
    if open_in_comp:
        report.append(f"    *** OPEN ISSUES IN THIS COMPONENT: ***")
        for oi in open_in_comp:
            report.append(f"      #{oi['number']} {oi['title']}")

if unclassified:
    report.append(f"\n  UNCLASSIFIED ISSUES: {len(unclassified)}")
    for i in unclassified:
        report.append(f"    #{i['number']} [{i['state']}] {i['title']}")
        report.append(f"      Labels: {', '.join(get_labels(i))}")

# ============================================================
# SECTION 3: Verify lifecycle completeness for completed organelles
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 3: LIFECYCLE COMPLETENESS CHECK (COMPLETED ORGANELLES)")
report.append("=" * 80)

# The 4 completed AI Cognitive Fabric organelles
completed_organelles = {
    'INSTRUMENTATION_PROBE': {'range': (465, 493), 'master': 465},
    'EXTERNAL_ADAPTER': {'range': (494, 522), 'master': 494},
    'RESULT_VALIDATOR': {'range': (958, 986), 'master': 958},
    'AUDIT_EMITTER': {'range': (987, 1015), 'master': 987},
}

for org_name, info in completed_organelles.items():
    report.append(f"\n  --- {org_name} (#{info['range'][0]}-#{info['range'][1]}) ---")
    
    # Find all issues in this range
    org_issues = [i for i in issues_only if info['range'][0] <= i['number'] <= info['range'][1]]
    
    if not org_issues:
        report.append(f"    *** WARNING: No issues found in range #{info['range'][0]}-#{info['range'][1]}!")
        continue
    
    report.append(f"    Total issues in range: {len(org_issues)}")
    
    # Check each issue state
    open_in_range = [i for i in org_issues if i['state'] == 'open']
    closed_in_range = [i for i in org_issues if i['state'] == 'closed']
    report.append(f"    Open: {len(open_in_range)}, Closed: {len(closed_in_range)}")
    
    if open_in_range:
        report.append(f"    *** CRITICAL: OPEN ISSUES IN COMPLETED ORGANELLE: ***")
        for oi in open_in_range:
            report.append(f"      #{oi['number']} {oi['title']}")
    
    # Verify expected structure: 1 master + 7 phases + 21 tasks = 29 issues
    expected_count = 29
    if len(org_issues) != expected_count:
        report.append(f"    *** WARNING: Expected {expected_count} issues, found {len(org_issues)}")
    
    # Check each phase
    for phase_num in range(7):
        phase_label = f"P{phase_num}"
        phase_issues_in_org = [i for i in org_issues if f'[{phase_label}]' in i['title'] or f'P{phase_num}-' in i['title'] or f'P{phase_num} ' in i['title']]
        
        # Also check by position: master=0, then P0(phase+3tasks)=4, P1=4, etc.
        # Expected: master(1) + P0(1phase+3tasks) + P1(4) + P2(4) + P3(4) + P4(4) + P5(4) + P6(4) = 29
        
        phase_open = [i for i in phase_issues_in_org if i['state'] == 'open']
        phase_closed = [i for i in phase_issues_in_org if i['state'] == 'closed']
        
        if phase_issues_in_org:
            status = "OK" if not phase_open else f"*** {len(phase_open)} OPEN ***"
            report.append(f"    {phase_label}: {len(phase_issues_in_org)} issues ({len(phase_closed)} closed) - {status}")
        
    # Verify master issue
    master = [i for i in org_issues if i['number'] == info['master']]
    if master:
        m = master[0]
        report.append(f"    Master #{m['number']}: {m['state'].upper()}")
        if m['state'] == 'open':
            report.append(f"    *** CRITICAL: Master issue still OPEN! ***")
    else:
        report.append(f"    *** CRITICAL: Master issue #{info['master']} NOT FOUND! ***")

# ============================================================
# SECTION 4: Detailed issue-by-issue listing for completed organelles
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 4: ISSUE-BY-ISSUE DETAIL FOR COMPLETED ORGANELLES")
report.append("=" * 80)

for org_name, info in completed_organelles.items():
    report.append(f"\n  === {org_name} ===")
    org_issues = sorted([i for i in issues_only if info['range'][0] <= i['number'] <= info['range'][1]], key=lambda x: x['number'])
    
    for i in org_issues:
        labels = get_labels(i)
        assignees = get_assignees(i)
        milestone = get_milestone(i)
        state_icon = "CLOSED" if i['state'] == 'closed' else "*** OPEN ***"
        report.append(f"    #{i['number']} [{state_icon}] {i['title'][:90]}")
        report.append(f"      Labels: {', '.join(labels[:5]) if labels else 'NONE'}")
        report.append(f"      Assignees: {', '.join(assignees) if assignees else 'NONE'}")
        report.append(f"      Milestone: {milestone}")

# ============================================================
# SECTION 5: Check remaining (non-completed) organelle issues
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 5: REMAINING ORGANELLE ISSUES (NOT YET EXECUTED)")
report.append("=" * 80)

# Issues outside the completed ranges
completed_ranges = [(465, 493), (494, 522), (958, 986), (987, 1015)]
remaining = []
for i in issues_only:
    in_completed = any(r[0] <= i['number'] <= r[1] for r in completed_ranges)
    if not in_completed:
        remaining.append(i)

remaining_open = [i for i in remaining if i['state'] == 'open']
remaining_closed = [i for i in remaining if i['state'] == 'closed']
report.append(f"\n  Remaining issues: {len(remaining)} (Open: {len(remaining_open)}, Closed: {len(remaining_closed)})")

# Group remaining by state
if remaining_open:
    report.append(f"\n  Open remaining issues ({len(remaining_open)}):")
    for i in sorted(remaining_open, key=lambda x: x['number'])[:50]:
        report.append(f"    #{i['number']} {i['title'][:80]}")
    if len(remaining_open) > 50:
        report.append(f"    ... and {len(remaining_open) - 50} more")

if remaining_closed:
    report.append(f"\n  Closed remaining issues ({len(remaining_closed)}):")
    for i in sorted(remaining_closed, key=lambda x: x['number'])[:20]:
        report.append(f"    #{i['number']} {i['title'][:80]}")
    if len(remaining_closed) > 20:
        report.append(f"    ... and {len(remaining_closed) - 20} more")

# Write report
report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/01_issue_state_audit.txt", "w") as f:
    f.write(report_text)

print("\n" + report_text)
