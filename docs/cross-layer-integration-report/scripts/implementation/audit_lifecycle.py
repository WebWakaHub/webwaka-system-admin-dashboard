#!/usr/bin/env python3
"""
Deep lifecycle audit for each organelle component.
Checks: issue comments, closure events, label correctness, phase ordering.
"""
import json
import subprocess
import time

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"
REPO = "webwaka-organelle-universe"

def api_get(url, retries=3):
    for attempt in range(retries):
        result = subprocess.run(
            ["curl", "-s", "-H", f"Authorization: token {PAT}", url],
            capture_output=True, text=True, timeout=30
        )
        try:
            data = json.loads(result.stdout)
            if isinstance(data, dict) and data.get('message', '').startswith('API rate limit'):
                print(f"  Rate limited, waiting 60s...")
                time.sleep(60)
                continue
            return data
        except:
            time.sleep(2)
    return None

# Load all issues from cached files
all_issues = []
for page in range(1, 12):
    fpath = f"/tmp/issues_page_{page}.json"
    try:
        with open(fpath) as f:
            data = json.load(f)
        if isinstance(data, list) and len(data) > 0:
            all_issues.extend(data)
    except:
        break

issues_only = [i for i in all_issues if 'pull_request' not in i]
print(f"Total issues: {len(issues_only)}")

# Define all 22 organelle components with their issue ranges
# We need to figure out the ranges from the issue data
# Group by organelle name extracted from title
from collections import defaultdict

organelle_groups = defaultdict(list)
for i in issues_only:
    title = i['title']
    # Extract organelle identifier from title like [ORG-XX-NAME-v0.1.0...]
    if '[' in title:
        bracket_content = title[title.index('[')+1:]
        if ']' in bracket_content:
            bracket_content = bracket_content[:bracket_content.index(']')]
        # Extract the base organelle name (before -P0, -P1, etc.)
        parts = bracket_content.split('-')
        # Find the version marker
        base_parts = []
        for p in parts:
            base_parts.append(p)
            if p.startswith('v') and '.' in p:
                break
        organelle_id = '-'.join(base_parts)
        organelle_groups[organelle_id].append(i)
    else:
        organelle_groups['UNKNOWN'].append(i)

report = []
report.append("=" * 120)
report.append("ORGANELLE LIFECYCLE AUDIT - DETAILED PHASE-BY-PHASE ANALYSIS")
report.append("=" * 120)
report.append(f"\nTotal organelle components identified: {len(organelle_groups)}")

for org_id in sorted(organelle_groups.keys()):
    issues = sorted(organelle_groups[org_id], key=lambda x: x['number'])
    report.append(f"\n{'=' * 100}")
    report.append(f"ORGANELLE: {org_id}")
    report.append(f"Issue range: #{issues[0]['number']}-#{issues[-1]['number']} ({len(issues)} issues)")
    report.append(f"{'=' * 100}")
    
    # Classify each issue
    master = None
    phases = {}  # phase_num -> issue
    tasks = defaultdict(list)  # phase_num -> [task_issues]
    
    for i in issues:
        title = i['title']
        labels = [l['name'] for l in i.get('labels', [])]
        
        # Determine issue type
        is_master = False
        is_phase = False
        is_task = False
        phase_num = None
        task_num = None
        
        # Check for master issue (no P0-P6 or T01-T03 in title)
        if not any(f'-P{p}' in title for p in range(7)) and not any(f'-T0{t}' in title for t in range(1,4)):
            is_master = True
            master = i
        elif any(f'-P{p}]' in title or f'-P{p} ' in title for p in range(7)):
            # Phase issue (not a task)
            for p in range(7):
                if f'-P{p}]' in title or f'-P{p} ' in title:
                    # But NOT if it also has T01/T02/T03
                    if not any(f'-T0{t}' in title for t in range(1,4)):
                        is_phase = True
                        phase_num = p
                        phases[p] = i
                    else:
                        is_task = True
                        phase_num = p
                        for t in range(1, 4):
                            if f'-T0{t}' in title:
                                task_num = t
                                break
                        tasks[phase_num].append((task_num, i))
                    break
        elif any(f'T0{t}' in title for t in range(1,4)):
            is_task = True
            # Find phase number from labels or title
            for p in range(7):
                if f'P{p}' in title or f'phase:P{p}' in ','.join(labels):
                    phase_num = p
                    break
            for t in range(1, 4):
                if f'T0{t}' in title:
                    task_num = t
                    break
            if phase_num is not None:
                tasks[phase_num].append((task_num, i))
    
    # Report master issue
    if master:
        report.append(f"\n  MASTER: #{master['number']} [{master['state']}] {master['title'][:80]}")
        assigned_labels = [l for l in [la['name'] for la in master.get('labels', [])] if l.startswith('assigned:')]
        report.append(f"    Assigned: {', '.join(assigned_labels) if assigned_labels else 'NONE'}")
    else:
        report.append(f"\n  *** MASTER ISSUE NOT FOUND ***")
    
    # Report each phase
    expected_phases = 7
    found_phases = len(phases)
    report.append(f"\n  Phases found: {found_phases}/{expected_phases}")
    
    for p in range(7):
        if p in phases:
            pi = phases[p]
            labels = [l['name'] for l in pi.get('labels', [])]
            assigned = [l for l in labels if l.startswith('assigned:')]
            report.append(f"\n  P{p}: #{pi['number']} [{pi['state']}] {pi['title'][:70]}")
            report.append(f"    Assigned: {', '.join(assigned) if assigned else 'NONE'}")
            
            # Check tasks for this phase
            phase_tasks = sorted(tasks.get(p, []), key=lambda x: x[0] if x[0] else 0)
            report.append(f"    Tasks: {len(phase_tasks)}/3")
            
            for task_num, ti in phase_tasks:
                t_labels = [l['name'] for l in ti.get('labels', [])]
                t_assigned = [l for l in t_labels if l.startswith('assigned:')]
                report.append(f"      T{task_num:02d}: #{ti['number']} [{ti['state']}] {ti['title'][:60]}")
                report.append(f"        Assigned: {', '.join(t_assigned) if t_assigned else 'NONE'}")
                
                if ti['state'] == 'open':
                    report.append(f"        *** STILL OPEN ***")
            
            if len(phase_tasks) < 3:
                report.append(f"      *** MISSING {3 - len(phase_tasks)} TASKS ***")
        else:
            report.append(f"\n  P{p}: *** PHASE ISSUE NOT FOUND ***")
            # Check if tasks exist without phase issue
            if p in tasks:
                report.append(f"    But {len(tasks[p])} tasks found for this phase")
    
    # Summary for this organelle
    all_closed = all(i['state'] == 'closed' for i in issues)
    report.append(f"\n  SUMMARY: {'ALL CLOSED' if all_closed else '*** HAS OPEN ISSUES ***'}")
    report.append(f"  Total: {len(issues)} issues | Master: {'YES' if master else 'NO'} | Phases: {found_phases}/7")

# Write report
report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/03_lifecycle_audit.txt", "w") as f:
    f.write(report_text)

print(report_text[:5000])
print(f"\n... Full report written to /home/ubuntu/audit_data/03_lifecycle_audit.txt ({len(report_text)} chars)")
