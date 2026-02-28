#!/usr/bin/env python3
"""
Parse all organ-universe issues with correct title format matching.
Title format: [ORGX-DOM-NAME-v0.1.0-P0-T01] Task description
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

# Separate archive from active
archive = [i for i in issues if 'ARCHIVE' in i.get('title', '')]
active = [i for i in issues if 'ARCHIVE' not in i.get('title', '')]
print(f"Archive/dormant: {len(archive)}")
print(f"Active: {len(active)}")

# Parse active issues
organs = {}

for issue in active:
    title = issue.get("title", "")
    num = issue["number"]
    labels = [l["name"] for l in issue.get("labels", [])]
    assignees = [a["login"] for a in issue.get("assignees", [])]
    
    # Extract organ ID from title bracket
    bracket_match = re.match(r'^\[([A-Z0-9_-]+)-v[\d.]+(?:-P\d+)?(?:-T\d+)?\]', title)
    if not bracket_match:
        continue
    
    organ_id = bracket_match.group(1)
    
    if organ_id not in organs:
        organs[organ_id] = {
            "master": None,
            "phases": {},
            "tasks": {},
            "ai_supplementary": [],
            "agents": {},
        }
    
    # Get agent from assignees or labels
    agent = assignees[0] if assignees else None
    if not agent:
        for label in labels:
            if label.startswith("assigned:"):
                agent = label.split("assigned:")[1].strip()
                break
    
    # Determine issue type by title pattern
    # Task: contains -P#-T## in bracket
    task_match = re.match(r'^\[.+-P(\d+)-T(\d+)\]', title)
    # Phase: contains -P# but no -T in bracket
    phase_match = re.match(r'^\[.+-P(\d+)\]', title)
    # AI supplementary: "AI " in title after bracket
    ai_match = re.search(r'\]\s*AI\s', title)
    # Master: "Master Issue" or organ name in title
    master_match = re.search(r'Master Issue|Organ\s*[—–-]', title)
    
    if task_match:
        phase_num = int(task_match.group(1))
        task_num = int(task_match.group(2))
        organs[organ_id]["tasks"][(phase_num, task_num)] = {
            "issue": num,
            "agent": agent,
            "title": title,
        }
        if agent:
            organs[organ_id]["agents"][(phase_num, task_num)] = agent
    elif phase_match and not task_match:
        phase_num = int(phase_match.group(1))
        organs[organ_id]["phases"][phase_num] = {
            "issue": num,
            "agent": agent,
        }
    elif ai_match:
        organs[organ_id]["ai_supplementary"].append({
            "issue": num,
            "title": title,
            "agent": agent,
        })
    elif master_match or (organs[organ_id]["master"] is None and "type:master" in str(labels)):
        organs[organ_id]["master"] = num
    else:
        # Check labels for type:master
        if "type:master" in str(labels):
            organs[organ_id]["master"] = num
        else:
            # Unclassified - likely master if it's the organ name
            if organs[organ_id]["master"] is None:
                organs[organ_id]["master"] = num

# Build execution map
exec_map = {}
organ_list = sorted(organs.keys())

print(f"\nTotal organs: {len(organ_list)}")
print(f"\n{'='*80}")

complete_organs = 0
incomplete_organs = []

for organ_id in organ_list:
    o = organs[organ_id]
    
    # Build phases data
    phases_data = []
    complete = True
    for pn in range(7):
        phase_info = o["phases"].get(pn, {})
        tasks_data = []
        for tn in range(1, 4):
            task_info = o["tasks"].get((pn, tn), {})
            if not task_info.get("issue"):
                complete = False
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
    
    if complete and o["master"]:
        complete_organs += 1
    else:
        missing = []
        if not o["master"]:
            missing.append("master")
        for pn in range(7):
            if pn not in o["phases"]:
                missing.append(f"P{pn}")
            for tn in range(1, 4):
                if (pn, tn) not in o["tasks"]:
                    missing.append(f"P{pn}-T{tn:02d}")
        incomplete_organs.append((organ_id, missing))
    
    exec_map[organ_id] = {
        "master": o["master"],
        "phases": phases_data,
        "ai_supplementary": o["ai_supplementary"],
        "complete": complete and o["master"] is not None,
    }
    
    total_issues = 1 + len(o["phases"]) + len(o["tasks"]) + len(o["ai_supplementary"])
    print(f"{organ_id}: master=#{o['master']} phases={len(o['phases'])} tasks={len(o['tasks'])} ai={len(o['ai_supplementary'])} total={total_issues} {'✓' if complete and o['master'] else '✗'}")

print(f"\n{'='*80}")
print(f"Complete organs: {complete_organs}/{len(organ_list)}")
print(f"Incomplete organs: {len(incomplete_organs)}")

if incomplete_organs:
    print("\nIncomplete organs (first 10):")
    for oid, missing in incomplete_organs[:10]:
        print(f"  {oid}: missing {missing[:5]}...")

# Collect unique agents
all_agents = set()
for o in organs.values():
    for agent in o["agents"].values():
        if agent:
            all_agents.add(agent)
print(f"\nUnique agents: {sorted(all_agents)}")

# Save execution map
with open("/home/ubuntu/organ_data/execution_map.json", "w") as f:
    json.dump(exec_map, f, indent=2)

print(f"\nExecution map saved to /home/ubuntu/organ_data/execution_map.json")
