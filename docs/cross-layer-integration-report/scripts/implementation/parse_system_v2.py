#!/usr/bin/env python3
"""Parse system-universe issues with correct title format handling."""
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

# Separate archived vs active
archived = []
active = []
for i in issues:
    title = i['title']
    labels = [l['name'] for l in i.get('labels', [])]
    if '[ARCHIVE' in title or 'csrp:archived' in labels or 'structural:rogue-structure' in labels:
        archived.append(i)
    else:
        active.append(i)

print(f"Active issues: {len(active)}")
print(f"Archived issues: {len(archived)}")

# Parse active issues
systems = {}

for i in active:
    title = i['title']
    num = i['number']
    state = i['state']
    labels = [l['name'] for l in i.get('labels', [])]
    
    assigned_agent = None
    for l in labels:
        if l.startswith('assigned:'):
            assigned_agent = l.split(':')[1].strip()
    
    # Extract system ID from bracket pattern: [SYS-XXX-NAME-v0.1.0...]
    # Master: [SYS-ANA-ANALYTICSPLATFORM-v0.1.0] Master Issue
    # Phase: [SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P0] Specification
    # Task: [SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P0-T01] Specification Task 1
    # AI: [SYS-ANA-ANALYTICSPLATFORM-v0.1.0] AI ...
    
    m = re.match(r'\[(SYS[X]?-\w+-\w+)-v[\d.]+(?:-(P\d+)(?:-(T\d+))?)?\]', title)
    if not m:
        # Try AI cognitive fabric pattern
        m2 = re.match(r'\[(SYSX-AI-COGNITIVE_FABRIC)-v[\d.]+', title)
        if m2:
            sys_id = m2.group(1)
            if sys_id not in systems:
                systems[sys_id] = {'master': None, 'phases': {}, 'ai_issues': []}
            
            if 'Master Issue' in title:
                systems[sys_id]['master'] = {'issue': num, 'state': state, 'agent': assigned_agent}
            else:
                systems[sys_id]['ai_issues'].append({'issue': num, 'state': state, 'agent': assigned_agent, 'title': title})
            continue
        else:
            print(f"  UNMATCHED: #{num} {title[:80]}")
            continue
    
    sys_id = m.group(1)
    phase_str = m.group(2)  # e.g., P0 or None
    task_str = m.group(3)   # e.g., T01 or None
    
    if sys_id not in systems:
        systems[sys_id] = {'master': None, 'phases': {}, 'ai_issues': []}
    
    if phase_str is None and task_str is None:
        # Could be master or AI supplementary
        if 'Master Issue' in title:
            systems[sys_id]['master'] = {'issue': num, 'state': state, 'agent': assigned_agent}
        else:
            # AI supplementary
            systems[sys_id]['ai_issues'].append({'issue': num, 'state': state, 'agent': assigned_agent, 'title': title})
    elif phase_str and task_str is None:
        # Phase issue
        pn = int(phase_str[1:])
        if pn not in systems[sys_id]['phases']:
            systems[sys_id]['phases'][pn] = {'issue': num, 'phase': pn, 'state': state, 'agent': assigned_agent, 'tasks': []}
        else:
            systems[sys_id]['phases'][pn]['issue'] = num
            systems[sys_id]['phases'][pn]['state'] = state
            systems[sys_id]['phases'][pn]['agent'] = assigned_agent
    elif phase_str and task_str:
        # Task issue
        pn = int(phase_str[1:])
        tn = int(task_str[1:])
        if pn not in systems[sys_id]['phases']:
            systems[sys_id]['phases'][pn] = {'issue': None, 'phase': pn, 'state': None, 'agent': None, 'tasks': []}
        systems[sys_id]['phases'][pn]['tasks'].append({
            'issue': num, 'task': tn, 'state': state, 'agent': assigned_agent
        })

# Sort tasks within phases
for sid in systems:
    for pn in systems[sid]['phases']:
        systems[sid]['phases'][pn]['tasks'].sort(key=lambda t: t['task'])

# Print summary
print(f"\n{'='*80}")
print("SYSTEM-UNIVERSE STRUCTURE SUMMARY")
print(f"{'='*80}")

total_active = 0
agents_seen = set()

for sid in sorted(systems.keys()):
    data = systems[sid]
    master = data['master']
    phases = data['phases']
    ai = data['ai_issues']
    
    n_phases = len(phases)
    n_tasks = sum(len(p['tasks']) for p in phases.values())
    n_ai = len(ai)
    n_total = (1 if master else 0) + n_phases + n_tasks + n_ai
    total_active += n_total
    
    if master and master['agent']:
        agents_seen.add(master['agent'])
    for pn, p in phases.items():
        if p['agent']:
            agents_seen.add(p['agent'])
        for t in p['tasks']:
            if t['agent']:
                agents_seen.add(t['agent'])
    
    complete = n_phases == 7 and n_tasks == 21
    status = "COMPLETE" if complete else f"INCOMPLETE (P={n_phases}, T={n_tasks})"
    
    print(f"\n{sid}: {status}")
    print(f"  Master: #{master['issue'] if master else 'MISSING'} ({master['state'] if master else 'N/A'})")
    print(f"  Phases: {n_phases}, Tasks: {n_tasks}, AI supplementary: {n_ai}")
    
    for pn in sorted(phases.keys()):
        p = phases[pn]
        task_agents = set(t['agent'] for t in p['tasks'] if t['agent'])
        task_issues = [f"#{t['issue']}" for t in p['tasks']]
        print(f"    P{pn}: #{p['issue']} agent={p['agent']} tasks={task_issues} task_agents={task_agents}")

print(f"\n{'='*80}")
print(f"Total systems: {len(systems)}")
print(f"Total active issues mapped: {total_active}")
print(f"Total archived issues: {len(archived)}")
print(f"Agents seen: {sorted(agents_seen)}")
print(f"{'='*80}")

# Save execution map
exec_map = {}
for sid, data in systems.items():
    exec_map[sid] = {
        'master': data['master']['issue'] if data['master'] else None,
        'master_agent': data['master']['agent'] if data['master'] else None,
        'phases': [{
            'phase': pn,
            'issue': data['phases'][pn]['issue'],
            'agent': data['phases'][pn]['agent'],
            'tasks': data['phases'][pn]['tasks']
        } for pn in sorted(data['phases'].keys())],
        'ai_issues': [a['issue'] for a in data['ai_issues']]
    }

with open('/home/ubuntu/system_data/execution_map.json', 'w') as f:
    json.dump(exec_map, f, indent=2)

# Save repo map
repo_map = {}
for sid in sorted(systems.keys()):
    parts = sid.split('-')
    if sid.startswith('SYSX-AI'):
        repo_map[sid] = "webwaka-system-ai-cognitive-fabric"
    else:
        domain = parts[1].lower()
        name = parts[2].lower()
        repo_map[sid] = f"webwaka-system-{domain}-{name}"

with open('/home/ubuntu/system_data/repo_map.json', 'w') as f:
    json.dump(repo_map, f, indent=2)

print(f"\nRepo map:")
for sid, repo in sorted(repo_map.items()):
    print(f"  {sid} -> {repo}")

# Save context file
with open('/home/ubuntu/system_data/system_context.txt', 'w') as f:
    f.write(f"SYSTEM-UNIVERSE CONTEXT\n")
    f.write(f"Total systems: {len(systems)}\n")
    f.write(f"Total active issues: {total_active}\n")
    f.write(f"Total archived issues: {len(archived)}\n")
    f.write(f"Agents: {sorted(agents_seen)}\n\n")
    for sid in sorted(systems.keys()):
        data = systems[sid]
        master = data['master']
        phases = data['phases']
        ai = data['ai_issues']
        n_phases = len(phases)
        n_tasks = sum(len(p['tasks']) for p in phases.values())
        f.write(f"{sid}: master=#{master['issue'] if master else 'MISSING'} phases={n_phases} tasks={n_tasks} ai={len(ai)}\n")

print(f"\nContext saved to /home/ubuntu/system_data/system_context.txt")
