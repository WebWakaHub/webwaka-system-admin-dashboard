#!/usr/bin/env python3
"""Parse and map all system-universe issues into structured execution map."""
import json, os, re
from collections import defaultdict

issues = []
for page in range(1, 31):
    f = f'/home/ubuntu/system_data/issues_page_{page}.json'
    if not os.path.exists(f): break
    d = json.load(open(f))
    if not d: break
    issues.extend(d)

print(f"Total issues loaded: {len(issues)}")

# Categorize issues by title pattern
systems = {}  # system_id -> {master, phases: [{issue, tasks: []}], ai_issues: []}

# First pass: identify all unique system IDs from issue titles
system_ids = set()
for issue in issues:
    title = issue['title']
    # Master pattern: [MASTER] SYS-XXX-NAME-v0.1.0
    m = re.match(r'\[MASTER\]\s+(SYS[X]?-\w+-\w+)-v', title)
    if m:
        system_ids.add(m.group(1))
        continue
    # Phase pattern: [P0-Specification] SYS-XXX-NAME-v0.1.0
    m = re.match(r'\[P\d', title)
    if m:
        m2 = re.search(r'(SYS[X]?-\w+-\w+)-v', title)
        if m2:
            system_ids.add(m2.group(1))
        continue
    # Task pattern: [P0-T01] SYS-XXX-NAME-v0.1.0
    m = re.match(r'\[P\d+-T\d+', title)
    if m:
        m2 = re.search(r'(SYS[X]?-\w+-\w+)-v', title)
        if m2:
            system_ids.add(m2.group(1))
        continue
    # AI supplementary pattern
    m = re.search(r'(SYS[X]?-\w+-\w+)-v', title)
    if m:
        system_ids.add(m.group(1))

print(f"\nUnique system IDs found: {len(system_ids)}")
for sid in sorted(system_ids):
    print(f"  {sid}")

# Second pass: build structured map
for sid in sorted(system_ids):
    systems[sid] = {
        'master': None,
        'phases': [],
        'ai_issues': [],
        'other': []
    }

for issue in issues:
    title = issue['title']
    num = issue['number']
    state = issue['state']
    
    # Extract labels
    labels = [l['name'] for l in issue.get('labels', [])]
    assigned_agent = None
    for l in labels:
        if l.startswith('assigned:'):
            assigned_agent = l.split(':')[1].strip()
    
    # Find system ID
    sys_id = None
    m = re.search(r'(SYS[X]?-\w+-\w+)-v', title)
    if m:
        sys_id = m.group(1)
    
    if not sys_id or sys_id not in systems:
        continue
    
    # Categorize
    if '[MASTER]' in title:
        systems[sys_id]['master'] = {'issue': num, 'state': state, 'agent': assigned_agent, 'title': title}
    elif re.match(r'\[P(\d+)-T(\d+)', title):
        m2 = re.match(r'\[P(\d+)-T(\d+)', title)
        phase_num = int(m2.group(1))
        task_num = int(m2.group(2))
        systems[sys_id]['other'].append({
            'issue': num, 'type': 'task', 'phase': phase_num, 'task': task_num,
            'state': state, 'agent': assigned_agent, 'title': title
        })
    elif re.match(r'\[P(\d+)', title):
        m2 = re.match(r'\[P(\d+)', title)
        phase_num = int(m2.group(1))
        systems[sys_id]['other'].append({
            'issue': num, 'type': 'phase', 'phase': phase_num,
            'state': state, 'agent': assigned_agent, 'title': title
        })
    elif 'AI' in title or 'Cognitive' in title or 'COGNITIVE' in title:
        systems[sys_id]['ai_issues'].append({
            'issue': num, 'state': state, 'agent': assigned_agent, 'title': title
        })
    else:
        systems[sys_id]['other'].append({
            'issue': num, 'type': 'unknown', 'state': state, 'agent': assigned_agent, 'title': title
        })

# Third pass: organize phases and tasks
for sid, data in systems.items():
    phase_map = {}  # phase_num -> {issue, tasks: []}
    
    for item in data['other']:
        if item['type'] == 'phase':
            pn = item['phase']
            if pn not in phase_map:
                phase_map[pn] = {'issue': item['issue'], 'phase': pn, 'state': item['state'], 'agent': item['agent'], 'tasks': []}
            else:
                phase_map[pn]['issue'] = item['issue']
                phase_map[pn]['state'] = item['state']
                phase_map[pn]['agent'] = item['agent']
        elif item['type'] == 'task':
            pn = item['phase']
            if pn not in phase_map:
                phase_map[pn] = {'issue': None, 'phase': pn, 'state': None, 'agent': None, 'tasks': []}
            phase_map[pn]['tasks'].append({
                'issue': item['issue'], 'task': item['task'],
                'state': item['state'], 'agent': item['agent']
            })
    
    # Sort phases and tasks
    for pn in phase_map:
        phase_map[pn]['tasks'].sort(key=lambda t: t['task'])
    
    data['phases'] = [phase_map[pn] for pn in sorted(phase_map.keys())]
    del data['other']

# Print summary
print(f"\n{'='*80}")
print("SYSTEM-UNIVERSE STRUCTURE SUMMARY")
print(f"{'='*80}")

total_issues = 0
agents_seen = set()
standard_systems = []
ai_systems = []

for sid in sorted(systems.keys()):
    data = systems[sid]
    master = data['master']
    phases = data['phases']
    ai = data['ai_issues']
    
    is_ai = sid.startswith('SYSX-AI')
    
    n_phases = len(phases)
    n_tasks = sum(len(p['tasks']) for p in phases)
    n_ai = len(ai)
    n_total = (1 if master else 0) + n_phases + n_tasks + n_ai
    total_issues += n_total
    
    if master and master['agent']:
        agents_seen.add(master['agent'])
    for p in phases:
        if p['agent']:
            agents_seen.add(p['agent'])
        for t in p['tasks']:
            if t['agent']:
                agents_seen.add(t['agent'])
    
    if is_ai:
        ai_systems.append(sid)
    else:
        standard_systems.append(sid)
    
    print(f"\n{sid}:")
    print(f"  Master: #{master['issue'] if master else 'MISSING'} ({master['state'] if master else 'N/A'})")
    print(f"  Phases: {n_phases}, Tasks: {n_tasks}, AI: {n_ai}")
    print(f"  Total issues: {n_total}")
    
    for p in phases:
        task_agents = [t['agent'] for t in p['tasks'] if t['agent']]
        print(f"    P{p['phase']}: #{p['issue']} ({p['state']}) - {len(p['tasks'])} tasks - agents: {set(task_agents)}")

print(f"\n{'='*80}")
print(f"Standard systems: {len(standard_systems)}")
print(f"AI systems: {len(ai_systems)}")
print(f"Total mapped issues: {total_issues}")
print(f"Unmapped issues: {len(issues) - total_issues}")
print(f"Agents seen: {sorted(agents_seen)}")
print(f"{'='*80}")

# Save execution map
exec_map = {}
for sid, data in systems.items():
    exec_map[sid] = {
        'master': data['master']['issue'] if data['master'] else None,
        'phases': [{
            'phase': p['phase'],
            'issue': p['issue'],
            'agent': p['agent'],
            'tasks': p['tasks']
        } for p in data['phases']],
        'ai_issues': [a['issue'] for a in data['ai_issues']]
    }

with open('/home/ubuntu/system_data/execution_map.json', 'w') as f:
    json.dump(exec_map, f, indent=2)

# Save repo map
repo_map = {}
for sid in sorted(systems.keys()):
    # Convert SYS-ANA-ANALYTICSPLATFORM -> webwaka-system-ana-analyticsplatform
    parts = sid.split('-')
    if sid.startswith('SYSX-AI'):
        name = sid.lower().replace('sysx-ai-', 'ai-')
        repo_map[sid] = f"webwaka-system-{name}"
    else:
        domain = parts[1].lower()
        name = parts[2].lower()
        repo_map[sid] = f"webwaka-system-{domain}-{name}"

with open('/home/ubuntu/system_data/repo_map.json', 'w') as f:
    json.dump(repo_map, f, indent=2)

print(f"\nRepo map saved:")
for sid, repo in sorted(repo_map.items()):
    print(f"  {sid} -> {repo}")

print(f"\nExecution map saved to /home/ubuntu/system_data/execution_map.json")
print(f"Repo map saved to /home/ubuntu/system_data/repo_map.json")
