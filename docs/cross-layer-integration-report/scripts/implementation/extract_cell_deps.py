#!/usr/bin/env python3
"""
Extract dependency metadata from every cell-universe issue body.
For each issue, parse:
- Dependencies (blocked by)
- Unblocks (what it unblocks)
- Sequence Phase
- Is Root / Is Leaf
- Assigned agent (from labels)
- Phase and task info
"""
import json
import subprocess
import re
import time
from collections import defaultdict

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"
REPO = "webwaka-cell-universe"

def api_get(url):
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {PAT}", url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(result.stdout)
    except:
        return None

# Fetch ALL issues (paginated)
all_issues = []
for page in range(1, 20):
    data = api_get(f"https://api.github.com/repos/{ORG}/{REPO}/issues?state=all&per_page=100&page={page}&sort=created&direction=asc")
    if not data or not isinstance(data, list) or len(data) == 0:
        break
    all_issues.extend(data)
    time.sleep(0.3)

print(f"Total issues fetched: {len(all_issues)}")

# Parse each issue
cells = {}
issue_map = {}

for issue in all_issues:
    num = issue['number']
    title = issue['title']
    state = issue['state']
    body = issue.get('body', '') or ''
    labels = [l['name'] for l in issue.get('labels', [])]
    
    # Skip archived/ghost issues
    is_archived = any('archived' in l or 'ghost' in l for l in labels)
    
    # Extract assigned agent from labels
    assigned = 'none'
    for l in labels:
        if l.startswith('assigned:'):
            assigned = l.replace('assigned:', '')
    
    # Extract cell ID from title
    cel_match = re.search(r'\[(CEL-(?:AI-)?[A-Z_]+)-v(\d+\.\d+\.\d+)(?:-(P\d))?(?:-(T\d+))?\]', title)
    if not cel_match:
        continue
    
    cell_id = cel_match.group(1)
    version = cel_match.group(2)
    phase = cel_match.group(3)
    task = cel_match.group(4)
    
    # Extract dependency metadata from body
    deps = []
    unblocks = []
    seq_phase = None
    is_root = False
    is_leaf = False
    
    dep_section = re.search(r'Dependencies:\s*\n(.*?)(?:\n\*\*|\n---|\Z)', body, re.DOTALL)
    if dep_section:
        dep_text = dep_section.group(1)
        deps = [int(x) for x in re.findall(r'#(\d+)', dep_text)]
    
    unblock_section = re.search(r'Unblocks:\s*\n(.*?)(?:\n\*\*|\n---|\Z)', body, re.DOTALL)
    if unblock_section:
        unblock_text = unblock_section.group(1)
        unblocks = [int(x) for x in re.findall(r'#(\d+)', unblock_text)]
    
    seq_match = re.search(r'Sequence Phase:\s*(\S+)', body)
    if seq_match:
        seq_phase = seq_match.group(1)
    
    if 'Is Root:** Yes' in body:
        is_root = True
    if 'Is Leaf:** Yes' in body:
        is_leaf = True
    
    # Determine issue type
    if phase is None:
        issue_type = 'master'
    elif task is None:
        issue_type = 'phase'
    else:
        issue_type = 'task'
    
    issue_map[num] = {
        'num': num,
        'title': title,
        'state': state,
        'cell_id': cell_id,
        'version': version,
        'phase': phase,
        'task': task,
        'issue_type': issue_type,
        'assigned': assigned,
        'is_archived': is_archived,
        'deps': deps,
        'unblocks': unblocks,
        'seq_phase': seq_phase,
        'is_root': is_root,
        'is_leaf': is_leaf,
    }
    
    # Build cell structure
    if cell_id not in cells:
        cells[cell_id] = {
            'cell_id': cell_id,
            'version': version,
            'master': None,
            'phases': {},
            'is_ai': 'AI-' in cell_id,
        }
    
    if issue_type == 'master' and not is_archived:
        cells[cell_id]['master'] = num
        cells[cell_id]['master_agent'] = assigned
        cells[cell_id]['master_deps'] = deps
        cells[cell_id]['master_unblocks'] = unblocks
        cells[cell_id]['seq_phase'] = seq_phase
    elif issue_type == 'phase' and not is_archived:
        p_num = int(phase[1])
        if p_num not in cells[cell_id]['phases']:
            cells[cell_id]['phases'][p_num] = {'issue': num, 'agent': assigned, 'tasks': []}
        else:
            cells[cell_id]['phases'][p_num]['issue'] = num
            cells[cell_id]['phases'][p_num]['agent'] = assigned
    elif issue_type == 'task' and not is_archived:
        p_num = int(phase[1])
        if p_num not in cells[cell_id]['phases']:
            cells[cell_id]['phases'][p_num] = {'issue': None, 'agent': 'none', 'tasks': []}
        cells[cell_id]['phases'][p_num]['tasks'].append({
            'num': num,
            'task': task,
            'agent': assigned,
            'deps': deps,
            'unblocks': unblocks,
            'is_root': is_root,
        })

# Find root issues (no dependencies)
root_issues = [num for num, info in issue_map.items() if info['is_root'] and not info['is_archived']]

# Build execution order based on dependency graph
print(f"\nRoot issues (dependency roots): {len(root_issues)}")
for r in sorted(root_issues):
    info = issue_map[r]
    print(f"  #{r}: {info['title'][:60]} (agent: {info['assigned']})")

# Output full cell structure
print(f"\n{'='*120}")
print(f"CELL EXECUTION ORDER (by sequence phase)")
print(f"{'='*120}")

# Group cells by sequence phase
by_seq = defaultdict(list)
for cell_id, cell in cells.items():
    if cell.get('master') is None:
        continue
    seq = cell.get('seq_phase', 'unknown')
    by_seq[seq].append(cell_id)

for seq in sorted(by_seq.keys()):
    print(f"\n  Sequence Phase: {seq}")
    for cell_id in sorted(by_seq[seq], key=lambda x: cells[x].get('master', 999)):
        cell = cells[cell_id]
        master_deps = cell.get('master_deps', [])
        print(f"    {cell_id:30s} Master=#{cell['master']:4d} deps={master_deps} phases={sorted(cell['phases'].keys())}")
        for p_num in sorted(cell['phases'].keys()):
            p = cell['phases'][p_num]
            tasks = sorted(p['tasks'], key=lambda t: t['task'])
            task_agents = set(t['agent'] for t in tasks)
            print(f"      P{p_num}: #{p['issue']} agent={p['agent']:20s} tasks={[t['num'] for t in tasks]} task_agents={task_agents}")

# Save full data
output = {
    'total_issues': len(all_issues),
    'executable_cells': {k: v for k, v in cells.items() if v.get('master') is not None},
    'root_issues': root_issues,
    'sequence_phases': {k: v for k, v in by_seq.items()},
}

with open('/home/ubuntu/cell_universe_deps.json', 'w') as f:
    json.dump(output, f, indent=2, default=str)

print(f"\nFull data saved to /home/ubuntu/cell_universe_deps.json")
