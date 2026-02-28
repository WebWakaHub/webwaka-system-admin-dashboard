#!/usr/bin/env python3
"""Parse all tissue-universe issues to build the complete execution map."""
import json
import os
import re

DATA_DIR = "/home/ubuntu/tissue_data"
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

print(f"Total issues: {len(all_issues)}")

# Categorize issues by type
tissues = {}
for issue in all_issues:
    num = issue["number"]
    title = issue["title"]
    state = issue["state"]
    labels = [l["name"] for l in issue.get("labels", [])]
    assignees = [a["login"] for a in issue.get("assignees", [])]
    
    # Extract tissue ID from title
    # Master: "[MASTER] TIS-CMDCOORD — Command Coordination Tissue"
    # Phase: "[P0] TIS-CMDCOORD — Phase 0: Specification"
    # Task: "[P0-T01] TIS-CMDCOORD — ..."
    
    tissue_id = None
    issue_type = None
    phase = None
    task = None
    
    # Try to extract tissue ID
    tis_match = re.search(r'(TIS-[\w-]+)', title)
    if tis_match:
        tissue_id = tis_match.group(1)
    
    if "[MASTER]" in title:
        issue_type = "master"
    elif re.search(r'\[P\d+\]', title) and not re.search(r'\[P\d+-T\d+\]', title):
        issue_type = "phase"
        phase_match = re.search(r'\[P(\d+)\]', title)
        if phase_match:
            phase = int(phase_match.group(1))
    elif re.search(r'\[P\d+-T\d+\]', title):
        issue_type = "task"
        task_match = re.search(r'\[P(\d+)-T(\d+)\]', title)
        if task_match:
            phase = int(task_match.group(1))
            task = int(task_match.group(2))
    
    if tissue_id:
        if tissue_id not in tissues:
            tissues[tissue_id] = {
                "master": None,
                "phases": {},
                "tasks": {}
            }
        
        if issue_type == "master":
            tissues[tissue_id]["master"] = num
        elif issue_type == "phase" and phase is not None:
            tissues[tissue_id]["phases"][phase] = num
        elif issue_type == "task" and phase is not None and task is not None:
            key = f"P{phase}-T{task:02d}"
            tissues[tissue_id]["tasks"][key] = num
    
    # Get agent assignment
    agent = None
    for label in labels:
        if label.startswith("assigned:"):
            agent = label.replace("assigned:", "").strip()
    
    if tissue_id and issue_type == "task":
        if "task_agents" not in tissues[tissue_id]:
            tissues[tissue_id]["task_agents"] = {}
        tissues[tissue_id]["task_agents"][f"P{phase}-T{task:02d}"] = agent

# Print summary
print(f"\nTissues found: {len(tissues)}")
print(f"\n{'='*80}")

for tid in sorted(tissues.keys()):
    t = tissues[tid]
    master = t["master"]
    phases = t["phases"]
    tasks = t["tasks"]
    
    print(f"\n{tid}:")
    print(f"  Master: #{master}")
    print(f"  Phases ({len(phases)}): {', '.join([f'P{p}=#{n}' for p, n in sorted(phases.items())])}")
    print(f"  Tasks ({len(tasks)}): {', '.join([f'{k}=#{v}' for k, v in sorted(tasks.items())])}")
    
    # Check agent assignments
    if "task_agents" in t:
        agents = set(t["task_agents"].values())
        print(f"  Agents: {agents}")

# Check issue states
open_count = sum(1 for i in all_issues if i["state"] == "open")
closed_count = sum(1 for i in all_issues if i["state"] == "closed")
print(f"\n{'='*80}")
print(f"Issue States: {open_count} open, {closed_count} closed")

# Save the full map
output = {
    "total_issues": len(all_issues),
    "tissues": {}
}
for tid in sorted(tissues.keys()):
    t = tissues[tid]
    output["tissues"][tid] = {
        "master": t["master"],
        "phases": {f"P{k}": v for k, v in sorted(t["phases"].items())},
        "tasks": {k: v for k, v in sorted(t["tasks"].items())},
        "task_agents": t.get("task_agents", {})
    }

with open(os.path.join(DATA_DIR, "tissue_map.json"), "w") as f:
    json.dump(output, f, indent=2)

print(f"\nMap saved to {DATA_DIR}/tissue_map.json")
