#!/usr/bin/env python3
"""Build the complete tissue execution map with all task details, agents, and dependencies."""
import json
import re
import os

DATA_DIR = "/home/ubuntu/tissue_data"

# Load all issues
all_issues = []
for page in range(1, 21):
    path = os.path.join(DATA_DIR, f"issues_page_{page}.json")
    if not os.path.exists(path):
        break
    with open(path) as f:
        issues = json.load(f)
    if not issues:
        break
    all_issues.extend(issues)

all_issues.sort(key=lambda x: x["number"])

# Build tissue map
tissues = {}
issue_lookup = {}

for issue in all_issues:
    num = issue["number"]
    title = issue["title"]
    labels = [l["name"] for l in issue.get("labels", [])]
    
    issue_lookup[num] = issue
    
    bracket_match = re.match(r'\[(TIS-[\w-]+?)(-v[\d.]+)(?:-(P\d+))?(?:-(T\d+))?\]', title)
    if not bracket_match:
        continue
    
    tissue_base = bracket_match.group(1)
    version = bracket_match.group(2)
    phase_str = bracket_match.group(3)
    task_str = bracket_match.group(4)
    
    agent = None
    for l in labels:
        if l.startswith("assigned:"):
            agent = l.split(":")[1]
    
    if tissue_base not in tissues:
        tissues[tissue_base] = {
            "full_id": tissue_base + version,
            "master": None,
            "master_agent": None,
            "phases": [],
            "class_name": "",
            "kebab": "",
            "description": ""
        }
    
    if phase_str is None and task_str is None:
        tissues[tissue_base]["master"] = num
        tissues[tissue_base]["master_agent"] = agent
        # Extract description from title
        desc_match = re.search(r'\]\s*(.+?)(?:\s*—\s*Master Issue)?$', title)
        if desc_match:
            tissues[tissue_base]["description"] = desc_match.group(1).strip()
    elif phase_str and task_str is None:
        p = int(phase_str[1:])
        # Ensure phases list is long enough
        while len(tissues[tissue_base]["phases"]) <= p:
            tissues[tissue_base]["phases"].append({"issue": None, "agent": None, "tasks": []})
        tissues[tissue_base]["phases"][p]["issue"] = num
        tissues[tissue_base]["phases"][p]["agent"] = agent
    elif phase_str and task_str:
        p = int(phase_str[1:])
        t = int(task_str[1:])
        while len(tissues[tissue_base]["phases"]) <= p:
            tissues[tissue_base]["phases"].append({"issue": None, "agent": None, "tasks": []})
        # Extract task description
        task_desc_match = re.search(r'T\d+\]\s*(.+)$', title)
        task_desc = task_desc_match.group(1) if task_desc_match else ""
        tissues[tissue_base]["phases"][p]["tasks"].append({
            "task_num": t,
            "issue": num,
            "agent": agent,
            "description": task_desc
        })

# Generate class names and kebab names
name_map = {
    "TIS-CMDCOORD": ("CommandCoordinator", "cmd-coord"),
    "TIS-STATEAGG": ("StateAggregator", "state-agg"),
    "TIS-WORKFLOW": ("WorkflowTissue", "workflow"),
    "TIS-POLICY": ("PolicyTissue", "policy"),
    "TIS-EVENT": ("EventTissue", "event"),
    "TIS-VALIDATE": ("ValidationTissue", "validate"),
    "TIS-RESOURCE": ("ResourceTissue", "resource"),
    "TIS-MONITOR": ("MonitorTissue", "monitor"),
    "TIS-AI-COGNITIVE_TISSUE": ("CognitiveTissue", "ai-cognitive"),
    "TIS-AI-ENTITLEMENT_TISSUE": ("EntitlementTissue", "ai-entitlement"),
}

for tid in tissues:
    if tid in name_map:
        tissues[tid]["class_name"] = name_map[tid][0]
        tissues[tid]["kebab"] = name_map[tid][1]

# Sort tasks within each phase
for tid in tissues:
    for phase in tissues[tid]["phases"]:
        phase["tasks"].sort(key=lambda x: x["task_num"])

# Print execution map
print("=" * 80)
print("TISSUE-UNIVERSE EXECUTION MAP")
print("=" * 80)

total_issues = 0
for tid in sorted(tissues.keys()):
    t = tissues[tid]
    print(f"\n{tid} ({t['class_name']}) — repo: webwaka-tissue-{t['kebab']}")
    print(f"  Full ID: {t['full_id']}")
    print(f"  Master: #{t['master']} (agent: {t['master_agent']})")
    print(f"  Description: {t['description']}")
    total_issues += 1  # master
    
    for pi, phase in enumerate(t["phases"]):
        print(f"  P{pi}: #{phase['issue']} (phase agent: {phase['agent']})")
        total_issues += 1  # phase
        for task in phase["tasks"]:
            print(f"    T{task['task_num']:02d}: #{task['issue']} (agent: {task['agent']}) — {task['description'][:60]}")
            total_issues += 1  # task

print(f"\n{'='*80}")
print(f"Total tissues: {len(tissues)}")
print(f"Total issues mapped: {total_issues}")
print(f"Total issues in repo: {len(all_issues)}")

# Check for webwakaagent8 - not in canonical spec
agent8_issues = []
for tid in tissues:
    for phase in tissues[tid]["phases"]:
        for task in phase["tasks"]:
            if task["agent"] == "webwakaagent8":
                agent8_issues.append(f"{tid} P{tissues[tid]['phases'].index(phase)}-T{task['task_num']:02d} #{task['issue']}")

if agent8_issues:
    print(f"\nWARNING: {len(agent8_issues)} tasks assigned to webwakaagent8 (not in canonical spec):")
    for a in agent8_issues:
        print(f"  {a}")

# Save as JSON
output = {}
for tid in sorted(tissues.keys()):
    t = tissues[tid]
    phases_out = []
    for pi, phase in enumerate(t["phases"]):
        tasks_out = []
        for task in phase["tasks"]:
            tasks_out.append({
                "task_num": task["task_num"],
                "issue": task["issue"],
                "agent": task["agent"],
                "description": task["description"]
            })
        phases_out.append({
            "phase_num": pi,
            "issue": phase["issue"],
            "agent": phase["agent"],
            "tasks": tasks_out
        })
    output[tid] = {
        "full_id": t["full_id"],
        "class_name": t["class_name"],
        "kebab": t["kebab"],
        "master": t["master"],
        "master_agent": t["master_agent"],
        "description": t["description"],
        "phases": phases_out
    }

with open(os.path.join(DATA_DIR, "execution_map.json"), "w") as f:
    json.dump(output, f, indent=2)

print(f"\nExecution map saved to {DATA_DIR}/execution_map.json")
