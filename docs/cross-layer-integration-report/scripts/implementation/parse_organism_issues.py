import json, re, os

issues = []
for page in range(1, 3):
    path = f"/home/ubuntu/organism_data/issues_page_{page}.json"
    if os.path.exists(path):
        data = json.load(open(path))
        if isinstance(data, list):
            issues.extend(data)

print(f"Total issues: {len(issues)}")

# Categorize issues
master = None
phases = {}
tasks = {}
ai_issues = []
unmatched = []

for issue in issues:
    title = issue["title"]
    num = issue["number"]
    state = issue["state"]
    labels = [l["name"] for l in issue.get("labels", [])]
    
    # Get assigned agent
    agent = None
    for l in labels:
        if l.startswith("assigned:"):
            agent = l.split(":")[1].strip()
    
    print(f"  #{num} [{state}] {title}")
    print(f"    Labels: {labels}")
    print(f"    Agent: {agent}")
    
    # Master issue
    if "Master" in title or "master" in title.lower():
        master = {"number": num, "title": title, "state": state, "agent": agent}
        continue
    
    # AI supplementary
    ai_match = re.search(r'AI-O(\d+)', title)
    if ai_match:
        ai_issues.append({"number": num, "title": title, "state": state, "agent": agent, "ai_id": f"O{ai_match.group(1)}"})
        continue
    
    # Phase issue (e.g., P0_Specification)
    phase_match = re.search(r'P(\d+)[-_](?!T)', title)
    if phase_match and not re.search(r'P\d+-T\d+', title):
        p = int(phase_match.group(1))
        phases[p] = {"number": num, "title": title, "state": state, "agent": agent}
        continue
    
    # Task issue (e.g., P0-T01)
    task_match = re.search(r'P(\d+)[-_]T(\d+)', title)
    if task_match:
        p = int(task_match.group(1))
        t = int(task_match.group(2))
        key = f"P{p}-T{t:02d}"
        tasks[key] = {"number": num, "title": title, "state": state, "agent": agent}
        continue
    
    unmatched.append({"number": num, "title": title, "state": state})

print("\n=== SUMMARY ===")
print(f"Master: #{master['number'] if master else 'MISSING'} [{master['state'] if master else 'N/A'}]")
print(f"Phases: {len(phases)} (expected 7)")
print(f"Tasks: {len(tasks)} (expected 21)")
print(f"AI Issues: {len(ai_issues)} (expected 5)")
print(f"Unmatched: {len(unmatched)}")

print("\n=== EXECUTION ORDER ===")
for p in range(7):
    if p in phases:
        ph = phases[p]
        print(f"\nPhase P{p}: #{ph['number']} [{ph['state']}] Agent: {ph['agent']}")
        for t in range(1, 4):
            key = f"P{p}-T{t:02d}"
            if key in tasks:
                tk = tasks[key]
                print(f"  {key}: #{tk['number']} [{tk['state']}] Agent: {tk['agent']}")
            else:
                print(f"  {key}: MISSING!")

print("\n=== AI SUPPLEMENTARY ===")
for ai in sorted(ai_issues, key=lambda x: x["ai_id"]):
    print(f"  {ai['ai_id']}: #{ai['number']} [{ai['state']}] Agent: {ai['agent']}")

if unmatched:
    print("\n=== UNMATCHED ===")
    for u in unmatched:
        print(f"  #{u['number']} [{u['state']}] {u['title']}")

# Save execution map
exec_map = {
    "organism_id": "ORG-WEBWAKA-PLATFORM",
    "master": master,
    "phases": {f"P{k}": v for k, v in phases.items()},
    "tasks": tasks,
    "ai_issues": ai_issues,
    "total_issues": len(issues),
    "open_count": sum(1 for i in issues if i["state"] == "open"),
    "closed_count": sum(1 for i in issues if i["state"] == "closed"),
}
with open("/home/ubuntu/organism_data/execution_map.json", "w") as f:
    json.dump(exec_map, f, indent=2)
print("\nExecution map saved to /home/ubuntu/organism_data/execution_map.json")
