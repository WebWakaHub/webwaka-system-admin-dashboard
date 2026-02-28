#!/usr/bin/env python3
"""
Parse the cell-universe issues file and produce a structured analysis:
- Identify all cells (components)
- Separate archived/ghost issues from executable ones
- Map phase structure per cell
- Identify agent assignments per phase
- Determine execution order
"""
import re
from collections import defaultdict

with open("/home/ubuntu/cell_universe_issues.txt") as f:
    lines = f.readlines()

cells = defaultdict(lambda: {"master": None, "phases": defaultdict(lambda: {"issue": None, "tasks": [], "agent": None}), "type": None, "archived_issues": []})

exec_issues = []
skip_issues = []

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Parse: #  NNN [state ] [FLAG] agent=XXXX | TITLE
    m = re.match(r'#\s*(\d+)\s+\[(\w+)\s*\]\s+\[(\w+)\s*\]\s+agent=(\S+)\s+\|\s+(.*)', line)
    if not m:
        continue
    
    num = int(m.group(1))
    state = m.group(2)
    flag = m.group(3)
    agent = m.group(4)
    title = m.group(5).strip()
    
    if flag == "SKIP":
        skip_issues.append({"num": num, "title": title})
        # Try to extract cell ID for archived tracking
        cel_match = re.search(r'\[CEL-([A-Z_-]+)-v', title)
        if cel_match:
            cell_id = cel_match.group(1)
            cells[cell_id]["archived_issues"].append(num)
        continue
    
    # Extract cell ID and phase/task info
    # Patterns:
    # [CEL-CMDPROCESS-v0.1.0] Master Issue
    # [CEL-CMDPROCESS-v0.1.0-P0] Specification
    # [CEL-CMDPROCESS-v0.1.0-P0-T01] Specification Task 1
    # [CEL-AI-INFERENCE_CELL-v0.1.0] Master Issue
    
    cel_match = re.search(r'\[(CEL-(?:AI-)?[A-Z_]+)-v(\d+\.\d+\.\d+)(?:-(P\d))?(?:-(T\d+))?\]', title)
    if not cel_match:
        continue
    
    cell_id = cel_match.group(1)
    version = cel_match.group(2)
    phase = cel_match.group(3)  # P0, P1, etc. or None
    task = cel_match.group(4)   # T01, T02, T03 or None
    
    # Determine cell type
    if "AI-" in cell_id:
        cells[cell_id]["type"] = "ai"
    else:
        cells[cell_id]["type"] = "standard"
    
    cells[cell_id]["version"] = version
    
    if phase is None:
        # Master issue
        cells[cell_id]["master"] = num
        cells[cell_id]["master_agent"] = agent
    elif task is None:
        # Phase issue
        p_num = int(phase[1])
        cells[cell_id]["phases"][p_num]["issue"] = num
        cells[cell_id]["phases"][p_num]["agent"] = agent
    else:
        # Task issue
        p_num = int(phase[1])
        cells[cell_id]["phases"][p_num]["tasks"].append({"num": num, "task": task, "agent": agent})
    
    exec_issues.append({"num": num, "cell": cell_id, "phase": phase, "task": task, "agent": agent})

# Output analysis
report = []
report.append("=" * 120)
report.append("CELL-UNIVERSE STRUCTURE ANALYSIS")
report.append("=" * 120)
report.append(f"Total issues in file: {len(lines)}")
report.append(f"Executable issues: {len(exec_issues)}")
report.append(f"Archived/ghost issues: {len(skip_issues)}")
report.append(f"Total cells identified: {len(cells)}")

standard_cells = {k: v for k, v in cells.items() if v["type"] == "standard"}
ai_cells = {k: v for k, v in cells.items() if v["type"] == "ai"}

report.append(f"  Standard cells: {len(standard_cells)}")
report.append(f"  AI cells: {len(ai_cells)}")

report.append(f"\n{'='*120}")
report.append("STANDARD CELLS (execution order)")
report.append("=" * 120)

for cell_id in sorted(standard_cells.keys(), key=lambda x: cells[x].get("master", 999)):
    c = cells[cell_id]
    report.append(f"\n  CELL: {cell_id} (v{c.get('version','?')})")
    report.append(f"    Master Issue: #{c['master']} (agent: {c.get('master_agent','?')})")
    report.append(f"    Archived issues: {len(c['archived_issues'])}")
    for p_num in sorted(c["phases"].keys()):
        p = c["phases"][p_num]
        task_agents = set(t["agent"] for t in p["tasks"])
        task_nums = [t["num"] for t in p["tasks"]]
        report.append(f"    P{p_num}: Issue #{p['issue']} | Agent: {p['agent']} | Tasks: {task_nums} | Task agents: {task_agents}")

report.append(f"\n{'='*120}")
report.append("AI CELLS (execution order)")
report.append("=" * 120)

for cell_id in sorted(ai_cells.keys(), key=lambda x: cells[x].get("master", 999)):
    c = cells[cell_id]
    report.append(f"\n  CELL: {cell_id} (v{c.get('version','?')})")
    report.append(f"    Master Issue: #{c['master']} (agent: {c.get('master_agent','?')})")
    report.append(f"    Archived issues: {len(c['archived_issues'])}")
    for p_num in sorted(c["phases"].keys()):
        p = c["phases"][p_num]
        task_agents = set(t["agent"] for t in p["tasks"])
        task_nums = [t["num"] for t in p["tasks"]]
        report.append(f"    P{p_num}: Issue #{p['issue']} | Agent: {p['agent']} | Tasks: {task_nums} | Task agents: {task_agents}")

# Agent distribution
report.append(f"\n{'='*120}")
report.append("AGENT ASSIGNMENT DISTRIBUTION")
report.append("=" * 120)

agent_counts = defaultdict(int)
for issue in exec_issues:
    agent_counts[issue["agent"]] += 1

for agent, count in sorted(agent_counts.items(), key=lambda x: -x[1]):
    report.append(f"  {agent:25s}: {count} issues")

# Phase naming patterns
report.append(f"\n{'='*120}")
report.append("PHASE NAMING PATTERNS")
report.append("=" * 120)

# Check standard vs AI phase naming
for cell_id in sorted(cells.keys(), key=lambda x: cells[x].get("master", None) or 999):
    c = cells[cell_id]
    phase_names = []
    for p_num in sorted(c["phases"].keys()):
        p = c["phases"][p_num]
        # Get phase name from title
        for issue in exec_issues:
            if issue["num"] == p["issue"]:
                # Extract phase name from title
                title_match = re.search(r'P\d\]\s*(.*)', issue.get("title_full", ""))
                break
    report.append(f"  {cell_id}: phases {sorted(c['phases'].keys())}")

report_text = "\n".join(report)
with open("/home/ubuntu/cell_universe_structure.txt", "w") as f:
    f.write(report_text)

print(report_text)
