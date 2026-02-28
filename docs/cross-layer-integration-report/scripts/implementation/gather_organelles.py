#!/usr/bin/env python3
import json, time

# Load cached issues
all_issues = []
for page in range(1, 12):
    try:
        with open(f"/tmp/issues_page_{page}.json") as f:
            data = json.load(f)
        if isinstance(data, list) and len(data) > 0:
            all_issues.extend(data)
    except:
        break

issues_only = [i for i in all_issues if 'pull_request' not in i]

# Legitimate ranges (our 4 AI organelles)
LEGIT = [(465, 493), (494, 522), (958, 986), (987, 1015)]

def is_legit(n):
    return any(lo <= n <= hi for lo, hi in LEGIT)

# Find all master issues for standard organelles
from collections import defaultdict

organelles = {}
for i in issues_only:
    if is_legit(i['number']):
        continue
    title = i['title']
    labels = [l['name'] for l in i.get('labels', [])]
    assigned = [l for l in labels if l.startswith('assigned:')]
    
    # Extract organelle ID
    if '[' in title and ']' in title:
        bracket = title[title.index('[')+1:title.index(']')]
        # Get base (before -P0, -P1, etc.)
        parts = bracket.split('-')
        base_parts = []
        for p in parts:
            base_parts.append(p)
            if p.startswith('v') and '.' in p:
                break
        org_id = '-'.join(base_parts)
        
        if org_id not in organelles:
            organelles[org_id] = {'issues': [], 'master': None, 'phases': {}, 'tasks': defaultdict(list)}
        
        organelles[org_id]['issues'].append(i)
        
        # Classify
        is_task = any(f'T0{t}' in bracket for t in range(1,4))
        is_phase = any(f'-P{p}' in bracket for p in range(7)) and not is_task
        is_master = not is_task and not is_phase
        
        if is_master:
            organelles[org_id]['master'] = i
            organelles[org_id]['master_assigned'] = assigned
        elif is_phase:
            for p in range(7):
                if f'-P{p}' in bracket:
                    organelles[org_id]['phases'][p] = {'issue': i, 'assigned': assigned}
                    break
        elif is_task:
            for p in range(7):
                if f'P{p}' in bracket:
                    for t in range(1,4):
                        if f'T0{t}' in bracket:
                            organelles[org_id]['tasks'][p].append({'task': t, 'issue': i, 'assigned': assigned})
                            break
                    break

# Map organelle IDs to repo names
REPO_MAP = {
    "ORG-IA-SUBJECT_REGISTRY-v0.1.0": "webwaka-organelle-subject-registry",
    "ORG-IA-GOVERNANCE_REGISTRY-v0.1.0": "webwaka-organelle-governance-registry",
    "ORG-IA-DISCOVERY_REGISTRY-v0.1.0": "webwaka-organelle-discovery-registry",
    "ORG-EM-EVENT_DISPATCHER-v0.1.0": "webwaka-organelle-event-dispatcher",
    "ORG-CI-MESSAGE_GATEWAY-v0.1.0": "webwaka-organelle-message-gateway",
    "ORG-TS-TELEMETRY_COLLECTOR-v0.1.0": "webwaka-organelle-telemetry-collector",
    "ORG-CP-POLICY_DEFINITION-v0.1.0": "webwaka-organelle-policy-definition",
    "ORG-ST-TRUST_ASSERTION-v0.1.0": "webwaka-organelle-trust-assertion",
    "ORG-FV-VALIDATION_ENGINE-v0.1.0": "webwaka-organelle-validation-engine",
    "ORG-CM-COMPOSITION_MODELER-v0.1.0": "webwaka-organelle-composition-modeler",
    "ORG-RA-RESOURCE_ALLOCATOR-v0.1.0": "webwaka-organelle-resource-allocator",
    "ORG-ES-SCHEDULER_EXECUTOR-v0.1.0": "webwaka-organelle-scheduler-executor",
    "ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0": "webwaka-organelle-workflow-orchestrator",
    "ORG-DP-RECORD_STORE-v0.1.0": "webwaka-organelle-record-store",
    "ORG-LG-AUDIT_LOGGER-v0.1.0": "webwaka-organelle-audit-logger",
    "ORG-TB-BOUNDARY_CONTEXT-v0.1.0": "webwaka-organelle-subject-registry",  # May need separate
    "ORGN-AI-COGNITIVE_PORT-v0.1.0": "webwaka-organelle-cognitive-port",
    "ORGN-AI-PROMPT_ASSEMBLER-v0.1.0": "webwaka-organelle-prompt-assembler",
}

# Print summary
print("=" * 120)
print("18 STANDARD ORGANELLES TO RE-EXECUTE")
print("=" * 120)

for org_id in sorted(organelles.keys()):
    o = organelles[org_id]
    master = o['master']
    if not master:
        continue
    
    master_num = master['number']
    issue_nums = sorted([i['number'] for i in o['issues']])
    assigned = o.get('master_assigned', [])
    repo = REPO_MAP.get(org_id, 'UNKNOWN')
    
    # Get phase agents
    phase_agents = {}
    for p in range(7):
        if p in o['phases']:
            pa = o['phases'][p].get('assigned', [])
            phase_agents[f"P{p}"] = pa[0].replace('assigned:', '') if pa else 'NONE'
    
    print(f"\n{org_id}")
    print(f"  Master: #{master_num} | Issues: #{issue_nums[0]}-#{issue_nums[-1]} ({len(issue_nums)} total)")
    print(f"  Repo: {repo}")
    print(f"  Master assigned: {assigned}")
    print(f"  Phase agents: {phase_agents}")

# Save structured data for execution script
output = []
for org_id in sorted(organelles.keys()):
    o = organelles[org_id]
    master = o['master']
    if not master:
        continue
    
    issue_nums = sorted([i['number'] for i in o['issues']])
    repo = REPO_MAP.get(org_id, 'UNKNOWN')
    
    phase_agents = {}
    for p in range(7):
        if p in o['phases']:
            pa = o['phases'][p].get('assigned', [])
            phase_agents[p] = pa[0].replace('assigned:', '') if pa else 'webwakaagent4'
        else:
            phase_agents[p] = 'webwakaagent4'
    
    # Get task details
    task_details = {}
    for p in range(7):
        tasks = sorted(o['tasks'].get(p, []), key=lambda x: x['task'])
        task_details[p] = []
        for t in tasks:
            ta = t['assigned']
            agent = ta[0].replace('assigned:', '') if ta else phase_agents.get(p, 'webwakaagent4')
            task_details[p].append({
                'task_num': t['task'],
                'issue_num': t['issue']['number'],
                'agent': agent,
                'title': t['issue']['title'][:80]
            })
    
    entry = {
        'org_id': org_id,
        'master_num': master['number'],
        'repo': repo,
        'issue_range': (issue_nums[0], issue_nums[-1]),
        'phase_agents': phase_agents,
        'phase_issues': {p: o['phases'][p]['issue']['number'] for p in o['phases']},
        'task_details': task_details,
    }
    output.append(entry)

with open("/home/ubuntu/audit_data/organelle_execution_plan.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"\n\nExecution plan saved: {len(output)} organelles")
