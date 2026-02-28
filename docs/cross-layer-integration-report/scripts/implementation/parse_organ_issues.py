#!/usr/bin/env python3
"""
Parse and map all organ-universe issues into an execution map.
Identifies: organs, phases, tasks, agent assignments, AI supplementary issues.
"""
import json
import os
import re
from collections import defaultdict

issues = []
for page in range(1, 27):
    path = f'/home/ubuntu/organ_data/issues_page_{page}.json'
    if os.path.exists(path):
        data = json.load(open(path))
        if isinstance(data, list):
            issues.extend(data)

print(f"Total issues loaded: {len(issues)}")

# Parse issue structure
organs = defaultdict(lambda: {
    "master": None,
    "phases": {},
    "tasks": defaultdict(list),
    "ai_supplementary": [],
    "agents": defaultdict(set),
    "all_issues": [],
})

# Patterns for matching
master_pattern = re.compile(r'^\[([A-Z0-9_-]+)-v[\d.]+\]\s*(ORGX-[A-Z_-]+)')
phase_pattern = re.compile(r'^\[([A-Z0-9_-]+)-v[\d.]+\]\s*Phase\s*(\d+)')
task_pattern = re.compile(r'^\[([A-Z0-9_-]+)-v[\d.]+\]\s*P(\d+)-T(\d+)')
ai_pattern = re.compile(r'^\[([A-Z0-9_-]+)-v[\d.]+\]\s*AI\s')

# Also try alternative patterns
master_pattern2 = re.compile(r'^\[([A-Z0-9_-]+)-v[\d.]+\]\s*Master')
phase_pattern2 = re.compile(r'^\[([A-Z0-9_-]+)-v[\d.]+\]\s*P(\d+)\s*[-–]\s*Phase')

unmatched = []

for issue in issues:
    title = issue.get("title", "")
    num = issue["number"]
    labels = [l["name"] for l in issue.get("labels", [])]
    assignees = [a["login"] for a in issue.get("assignees", [])]
    
    # Extract organ ID from title
    organ_match = re.match(r'^\[([A-Z0-9_-]+)-v[\d.]+\]', title)
    if not organ_match:
        unmatched.append((num, title[:80]))
        continue
    
    organ_id = organ_match.group(1)
    
    # Determine issue type
    # Check for task first (most specific)
    task_m = re.search(r'P(\d+)-T(\d+)', title)
    phase_m = re.search(r'Phase\s*(\d+)|P(\d+)\s*[-–]\s*Phase|P(\d+)_Phase', title)
    
    if task_m:
        phase_num = int(task_m.group(1))
        task_num = int(task_m.group(2))
        agent = assignees[0] if assignees else None
        # Get agent from labels if not in assignees
        if not agent:
            for label in labels:
                if label.startswith("assigned:"):
                    agent = label.split("assigned:")[1].strip()
                    break
        organs[organ_id]["tasks"][(phase_num, task_num)] = {
            "issue": num,
            "agent": agent,
            "title": title,
        }
        if agent:
            organs[organ_id]["agents"][phase_num].add(agent)
        organs[organ_id]["all_issues"].append(num)
    elif phase_m:
        phase_num = int(phase_m.group(1) or phase_m.group(2) or phase_m.group(3))
        agent = assignees[0] if assignees else None
        if not agent:
            for label in labels:
                if label.startswith("assigned:"):
                    agent = label.split("assigned:")[1].strip()
                    break
        organs[organ_id]["phases"][phase_num] = {
            "issue": num,
            "agent": agent,
        }
        organs[organ_id]["all_issues"].append(num)
    elif "AI " in title and organ_id in title:
        organs[organ_id]["ai_supplementary"].append({
            "issue": num,
            "title": title,
        })
        organs[organ_id]["all_issues"].append(num)
    elif "Master" in title or re.search(r'ORGX-[A-Z]', title.replace(f'[{organ_id}-v0.1.0]', '').strip()):
        # This is likely the master issue
        if organs[organ_id]["master"] is None:
            organs[organ_id]["master"] = num
            organs[organ_id]["all_issues"].append(num)
        else:
            # Check if this is actually a master or something else
            organs[organ_id]["all_issues"].append(num)
    else:
        unmatched.append((num, title[:80]))

# Print summary
print(f"\nOrgans found: {len(organs)}")
print(f"Unmatched issues: {len(unmatched)}")

# Detailed per-organ summary
organ_list = sorted(organs.keys())
exec_map = {}

for organ_id in organ_list:
    o = organs[organ_id]
    phase_count = len(o["phases"])
    task_count = len(o["tasks"])
    ai_count = len(o["ai_supplementary"])
    total = len(o["all_issues"])
    
    # Build execution data
    phases_data = []
    for pn in range(7):
        phase_info = o["phases"].get(pn, {})
        tasks_data = []
        for tn in range(1, 4):
            task_info = o["tasks"].get((pn, tn), {})
            tasks_data.append({
                "task_num": tn,
                "issue": task_info.get("issue"),
                "agent": task_info.get("agent"),
                "description": task_info.get("title", ""),
            })
        phases_data.append({
            "phase_num": pn,
            "issue": phase_info.get("issue"),
            "agent": phase_info.get("agent"),
            "tasks": tasks_data,
        })
    
    exec_map[organ_id] = {
        "master": o["master"],
        "phases": phases_data,
        "ai_supplementary": o["ai_supplementary"],
        "total_issues": total,
    }
    
    print(f"\n{organ_id}:")
    print(f"  Master: #{o['master']}")
    print(f"  Phases: {phase_count}, Tasks: {task_count}, AI: {ai_count}")
    print(f"  Total issues: {total}")

# Save execution map
with open("/home/ubuntu/organ_data/execution_map.json", "w") as f:
    json.dump(exec_map, f, indent=2)

# Save summary
with open("/home/ubuntu/organ_data/organ_summary.txt", "w") as f:
    f.write(f"Total organs: {len(organs)}\n")
    f.write(f"Total issues: {len(issues)}\n")
    f.write(f"Unmatched: {len(unmatched)}\n\n")
    for organ_id in organ_list:
        o = organs[organ_id]
        f.write(f"{organ_id}:\n")
        f.write(f"  Master: #{o['master']}\n")
        f.write(f"  Phases: {len(o['phases'])}, Tasks: {len(o['tasks'])}, AI: {len(o['ai_supplementary'])}\n")
        f.write(f"  Total issues: {len(o['all_issues'])}\n")
        for pn in sorted(o['agents'].keys()):
            f.write(f"  P{pn}: agents={o['agents'][pn]}\n")
        f.write("\n")

if unmatched:
    print(f"\nFirst 10 unmatched:")
    for num, title in unmatched[:10]:
        print(f"  #{num}: {title}")

print(f"\nExecution map saved to /home/ubuntu/organ_data/execution_map.json")
print(f"Summary saved to /home/ubuntu/organ_data/organ_summary.txt")
