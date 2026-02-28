#!/usr/bin/env python3
"""
Deep Substantive Verification of All 16 Cell-Universe Repos
============================================================
Checks per cell:
1. Repo exists and is accessible
2. Commit log has phase-specific commits (P0-P6)
3. Commit authors are valid WebWaka agents
4. Expected directories exist for each phase
5. Expected files exist for each phase
6. All 21 task issues are closed with completion comments
7. All 7 phase issues are closed
8. Master issue is closed
9. src/types.ts contains cell-specific class references
10. Entity file contains class-specific logic with execute method
11. Test files contain actual test cases with describe/expect/class references
12. README references the correct cell class name and cell ID
13. package.json has the correct @webwaka/cell-{name} package name
14. Ratification approval references the correct cell ID and "RATIFIED"
15. Cross-repo uniqueness: all entity files have unique content hashes
"""
import json
import subprocess
import hashlib
import time
import os

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"
ISSUE_REPO = "webwaka-cell-universe"
REPORT_FILE = "/home/ubuntu/cell_verification_report.txt"

VALID_AGENTS = {"webwaka007", "webwakaagent3", "webwakaagent4", "webwakaagent5"}

CELLS = [
    {"cell_id": "CEL-CMDPROCESS", "kebab": "cmd-process", "class_name": "CommandProcessor", "master": 1,
     "phase_issues": [2,6,10,15,23,31,39], "task_issues": [3,4,5,7,8,9,11,12,14,17,19,21,25,27,29,33,35,37,41,43,45]},
    {"cell_id": "CEL-STATESTORE", "kebab": "state-store", "class_name": "StateStore", "master": 47,
     "phase_issues": [49,57,65,73,81,89,97], "task_issues": [51,53,55,59,61,63,67,69,71,75,77,79,83,85,87,91,93,95,99,101,103]},
    {"cell_id": "CEL-EVENTDISPATCH", "kebab": "event-dispatch", "class_name": "EventDispatcher", "master": 105,
     "phase_issues": [107,115,123,131,139,147,155], "task_issues": [109,111,113,117,119,121,125,127,129,133,135,137,141,143,145,149,151,153,157,159,161]},
    {"cell_id": "CEL-POLICYEVAL", "kebab": "policy-eval", "class_name": "PolicyEvaluator", "master": 163,
     "phase_issues": [165,173,181,189,197,205,213], "task_issues": [167,169,171,175,177,179,184,186,187,191,193,195,199,201,203,207,209,211,215,217,219]},
    {"cell_id": "CEL-VALIDATEEXEC", "kebab": "validate-exec", "class_name": "ValidationExecutor", "master": 221,
     "phase_issues": [223,231,239,247,254,262,270], "task_issues": [225,227,229,233,235,237,241,243,245,249,251,253,256,258,260,264,266,268,272,274,276]},
    {"cell_id": "CEL-RESOURCEREG", "kebab": "resource-reg", "class_name": "ResourceRegistry", "master": 278,
     "phase_issues": [280,288,296,304,312,320,328], "task_issues": [282,284,286,290,292,294,298,300,302,306,308,310,314,316,318,322,324,326,330,332,334]},
    {"cell_id": "CEL-AGGREGATE", "kebab": "aggregate", "class_name": "Aggregator", "master": 336,
     "phase_issues": [338,346,354,361,368,376,384], "task_issues": [340,342,344,348,350,352,356,358,360,363,364,366,370,372,374,378,380,382,386,389,390]},
    {"cell_id": "CEL-MONITOR", "kebab": "monitor", "class_name": "Monitor", "master": 392,
     "phase_issues": [394,402,410,418,427,434,442], "task_issues": [396,398,400,404,406,408,413,414,417,420,423,424,428,431,432,436,439,440,443,444,445]},
    {"cell_id": "CEL-IDRESOLVE", "kebab": "id-resolve", "class_name": "IdentityResolver", "master": 446,
     "phase_issues": [448,456,464,472,480,488,496], "task_issues": [450,452,454,458,460,462,466,468,470,474,476,478,482,484,486,490,492,494,498,499,500]},
    {"cell_id": "CEL-EXTADAPTER", "kebab": "ext-adapter", "class_name": "ExternalAdapter", "master": 515,
     "phase_issues": [516,520,524,528,532,536,540], "task_issues": [517,518,519,521,522,523,525,526,527,529,530,531,533,534,535,537,538,539,541,542,543]},
    {"cell_id": "CEL-TELEMETRY", "kebab": "telemetry", "class_name": "TelemetryCell", "master": 544,
     "phase_issues": [545,549,553,557,561,565,569], "task_issues": [546,547,548,550,551,552,554,555,556,558,559,560,562,563,564,566,567,568,570,571,572]},
    {"cell_id": "CEL-ACCESSCTRL", "kebab": "access-ctrl", "class_name": "AccessController", "master": 576,
     "phase_issues": [577,581,585,589,593,597,601], "task_issues": [578,579,580,582,583,584,586,587,588,590,591,592,594,595,596,598,599,600,602,603,604]},
    {"cell_id": "CEL-CIGATEWAY", "kebab": "ci-gateway", "class_name": "CIGateway", "master": 605,
     "phase_issues": [606,610,614,618,503,507,511], "task_issues": [607,608,609,611,612,613,615,616,617,619,501,502,504,505,506,508,509,510,512,513,514]},
    {"cell_id": "CEL-AI-COGNITIVE_CELL", "kebab": "ai-cognitive-cell", "class_name": "CognitiveCell", "master": 620,
     "phase_issues": [621,625,629,633,637,641,645], "task_issues": [622,623,624,626,627,628,630,631,632,634,635,636,638,639,640,642,643,644,646,647,648]},
    {"cell_id": "CEL-AI-INFERENCE_CELL", "kebab": "ai-inference-cell", "class_name": "InferenceCell", "master": 649,
     "phase_issues": [650,654,658,662,666,670,674], "task_issues": [651,652,653,655,656,657,659,660,661,663,664,665,667,668,669,671,672,673,675,676,677]},
    {"cell_id": "CEL-AI-STREAMING_CELL", "kebab": "ai-streaming-cell", "class_name": "StreamingCell", "master": 678,
     "phase_issues": [679,683,687,691,695,699,703], "task_issues": [680,681,682,684,685,686,688,689,690,692,693,694,696,697,698,700,701,702,704,705,706]},
]

def api_get(url, timeout=15):
    cmd = ["curl", "-s", "-H", f"Authorization: token {PAT}", url]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    try:
        return json.loads(result.stdout)
    except:
        return None

def get_file_content(repo, path):
    url = f"https://api.github.com/repos/{ORG}/{repo}/contents/{path}"
    resp = api_get(url)
    if resp and "content" in resp:
        import base64
        return base64.b64decode(resp["content"]).decode("utf-8", errors="replace")
    return None

def get_repo_tree(repo):
    url = f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1"
    resp = api_get(url)
    if resp and "tree" in resp:
        return [item["path"] for item in resp["tree"] if item["type"] == "blob"]
    return []

def get_commits(repo):
    url = f"https://api.github.com/repos/{ORG}/{repo}/commits?per_page=100"
    resp = api_get(url)
    if isinstance(resp, list):
        return resp
    return []

results = []
entity_hashes = {}
counters = {"total_checks": 0, "total_pass": 0, "total_fail": 0}
failures = []

report_lines = []
def rpt(line):
    report_lines.append(line)
    print(line)

rpt("=" * 80)
rpt("CELL-UNIVERSE DEEP SUBSTANTIVE VERIFICATION")
rpt(f"Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
rpt("=" * 80)

for ci, cell in enumerate(CELLS, 1):
    cid = cell["cell_id"]
    kebab = cell["kebab"]
    cn = cell["class_name"]
    repo = f"webwaka-cell-{kebab}"
    
    rpt(f"\n{'='*60}")
    rpt(f"CELL {ci}/16: {cid} ({cn})")
    rpt(f"Repo: {ORG}/{repo}")
    rpt(f"{'='*60}")
    
    cell_counters = {"checks": 0, "pass": 0, "fail": 0}
    cell_failures = []
    
    def check(name, condition, detail=""):
        cell_counters["checks"] += 1
        counters["total_checks"] += 1
        if condition:
            cell_counters["pass"] += 1
            counters["total_pass"] += 1
            rpt(f"  PASS: {name}")
        else:
            cell_counters["fail"] += 1
            counters["total_fail"] += 1
            msg = f"  FAIL: {name}" + (f" — {detail}" if detail else "")
            rpt(msg)
            cell_failures.append(msg)
            failures.append(f"{cid}: {name}" + (f" — {detail}" if detail else ""))
    
    # 1. Repo exists
    tree = get_repo_tree(repo)
    check("Repo exists and accessible", len(tree) > 0, f"Got {len(tree)} files")
    
    if len(tree) == 0:
        rpt(f"  SKIPPING remaining checks — repo not accessible")
        continue
    
    # 2-3. Commits
    commits = get_commits(repo)
    check("Has commits", len(commits) > 0, f"Found {len(commits)} commits")
    
    commit_messages = [c.get("commit", {}).get("message", "") for c in commits]
    commit_authors = [c.get("author", {}).get("login", "unknown") for c in commits if c.get("author")]
    
    # Check for phase-specific commits
    for phase_label in ["P0", "P1", "P2", "P3", "P4", "P5", "P6"]:
        has_phase = any(phase_label in msg for msg in commit_messages)
        check(f"Has {phase_label} commit", has_phase)
    
    # Check all commit authors are valid agents
    invalid_authors = [a for a in commit_authors if a not in VALID_AGENTS]
    check("All commit authors are valid agents", len(invalid_authors) == 0, f"Invalid: {invalid_authors}")
    
    # 4. Expected directories
    dirs_in_tree = set()
    for f in tree:
        parts = f.split("/")
        for i in range(1, len(parts)):
            dirs_in_tree.add("/".join(parts[:i]))
    
    expected_dirs = ["docs/spec", "docs/design", "docs/validation", "src", "tests", "docs/ratification"]
    for d in expected_dirs:
        check(f"Directory exists: {d}", d in dirs_in_tree)
    
    # 5. Expected files
    expected_files = {
        "docs/spec/purpose.md": "P0-T01",
        "docs/spec/inputs-outputs.md": "P0-T02",
        "docs/spec/invariants.md": "P0-T03",
        "docs/design/state-machine.md": "P1-T01",
        "docs/design/interfaces.md": "P1-T02",
        "docs/design/architecture.md": "P1-T03",
        "docs/validation/spec-completeness.md": "P2-T01",
        "docs/validation/design-consistency.md": "P2-T02",
        "docs/validation/invariant-check.md": "P2-T03",
        "src/types.ts": "P3-T01",
        f"src/{kebab}-cell.ts": "P3-T01",
        f"src/{kebab}-orchestrator.ts": "P3-T02",
        "src/index.ts": "P3-T03",
        "package.json": "P3-T03",
        "tsconfig.json": "P3-T03",
        f"tests/{kebab}-cell.test.ts": "P4-T01",
        f"tests/{kebab}-orchestrator.test.ts": "P4-T02",
        "jest.config.js": "P4-T03",
        "README.md": "P5-T01",
        "docs/api-reference.md": "P5-T02",
        "docs/deployment-guide.md": "P5-T03",
        "docs/ratification/checklist.md": "P6-T01",
        "docs/ratification/compliance.md": "P6-T02",
        "docs/ratification/approval.md": "P6-T03",
    }
    
    for filepath, phase_task in expected_files.items():
        check(f"File exists: {filepath} ({phase_task})", filepath in tree)
    
    # 6-8. Issue state checks
    # Master issue
    master_resp = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{cell['master']}")
    if master_resp:
        check("Master issue is closed", master_resp.get("state") == "closed")
    
    # Phase issues
    for pi, phase_num in enumerate(cell["phase_issues"]):
        phase_resp = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{phase_num}")
        if phase_resp:
            check(f"Phase P{pi} issue #{phase_num} is closed", phase_resp.get("state") == "closed")
        time.sleep(0.15)
    
    # Task issues
    for ti, task_num in enumerate(cell["task_issues"]):
        task_resp = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{task_num}")
        if task_resp:
            check(f"Task issue #{task_num} is closed", task_resp.get("state") == "closed")
            # Check for completion comment
            comments_resp = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{task_num}/comments?per_page=1")
            has_comment = isinstance(comments_resp, list) and len(comments_resp) > 0
            check(f"Task #{task_num} has completion comment", has_comment)
        time.sleep(0.15)
    
    # 9. types.ts content check
    types_content = get_file_content(repo, "src/types.ts")
    if types_content:
        check(f"types.ts references {cn}", cn in types_content)
        check("types.ts has CellState type", "CellState" in types_content)
        check("types.ts has OfflineQueueEntry (Offline First)", "OfflineQueueEntry" in types_content)
        check("types.ts has NetworkConfig (Nigeria First)", "NetworkConfig" in types_content)
    else:
        check("types.ts readable", False, "Could not read file")
    
    # 10. Entity file content check
    entity_content = get_file_content(repo, f"src/{kebab}-cell.ts")
    if entity_content:
        check(f"Entity references class {cn}", f"export class {cn}" in entity_content)
        check("Entity has execute method", "async execute(" in entity_content)
        check("Entity has executeOffline method (Offline First)", "executeOffline" in entity_content)
        check("Entity has sync method", "async sync(" in entity_content)
        check("Entity has Nigeria-first timeout (30000)", "30000" in entity_content)
        check("Entity has en-NG locale", "en-NG" in entity_content)
        
        # Hash for uniqueness
        h = hashlib.md5(entity_content.encode()).hexdigest()
        entity_hashes[cid] = h
    else:
        check("Entity file readable", False, "Could not read file")
    
    # 11. Test file content check
    test_content = get_file_content(repo, f"tests/{kebab}-cell.test.ts")
    if test_content:
        check(f"Test file references {cn}", cn in test_content)
        check("Test has describe blocks", "describe(" in test_content)
        check("Test has expect assertions", "expect(" in test_content)
        check("Test covers offline execution", "Offline" in test_content)
        check("Test covers Nigeria-first", "Nigeria" in test_content)
    else:
        check("Test file readable", False, "Could not read file")
    
    # 12. README check
    readme_content = get_file_content(repo, "README.md")
    if readme_content:
        check(f"README references {cn}", cn in readme_content)
        check(f"README references {cid}", cid in readme_content)
        check("README has doctrine compliance table", "Offline First" in readme_content)
    else:
        check("README readable", False, "Could not read file")
    
    # 13. package.json check
    pkg_content = get_file_content(repo, "package.json")
    if pkg_content:
        try:
            pkg = json.loads(pkg_content)
            expected_name = f"@webwaka/cell-{kebab}"
            check(f"package.json name is {expected_name}", pkg.get("name") == expected_name, f"Got: {pkg.get('name')}")
            check("package.json has test script", "test" in pkg.get("scripts", {}))
        except:
            check("package.json is valid JSON", False)
    else:
        check("package.json readable", False, "Could not read file")
    
    # 14. Ratification approval check
    approval_content = get_file_content(repo, "docs/ratification/approval.md")
    if approval_content:
        check(f"Approval references {cid}", cid in approval_content)
        check("Approval says RATIFIED", "RATIFIED" in approval_content)
    else:
        check("Approval file readable", False, "Could not read file")
    
    rpt(f"\n  CELL RESULT: {cell_counters['pass']}/{cell_counters['checks']} passed, {cell_counters['fail']} failed")
    if cell_failures:
        rpt(f"  FAILURES:")
        for f_msg in cell_failures:
            rpt(f"    {f_msg}")
    
    time.sleep(0.5)

# Cross-repo uniqueness check
rpt(f"\n{'='*60}")
rpt("CROSS-REPO UNIQUENESS CHECK")
rpt(f"{'='*60}")
unique_hashes = set(entity_hashes.values())
counters["total_checks"] += 1
if len(unique_hashes) == len(entity_hashes):
    counters["total_pass"] += 1
    rpt(f"  PASS: All {len(entity_hashes)} entity files have unique content hashes")
else:
    counters["total_fail"] += 1
    rpt(f"  FAIL: Only {len(unique_hashes)} unique hashes for {len(entity_hashes)} entities")
    # Find duplicates
    from collections import Counter
    hash_counts = Counter(entity_hashes.values())
    for h, count in hash_counts.items():
        if count > 1:
            dups = [cid for cid, eh in entity_hashes.items() if eh == h]
            rpt(f"    DUPLICATE: {dups}")
            failures.append(f"CROSS-REPO: Duplicate entity content: {dups}")

rpt(f"\n{'='*80}")
rpt("FINAL VERIFICATION SUMMARY")
rpt(f"{'='*80}")
rpt(f"  Total checks: {counters['total_checks']}")
rpt(f"  PASSED: {counters['total_pass']}")
rpt(f"  FAILED: {counters['total_fail']}")
rpt(f"  Pass rate: {counters['total_pass']/counters['total_checks']*100:.1f}%")
if failures:
    rpt(f"\n  ALL FAILURES:")
    for f_msg in failures:
        rpt(f"    - {f_msg}")
rpt(f"\n{'='*80}")

# Write report
with open(REPORT_FILE, "w") as f:
    f.write("\n".join(report_lines))

print(f"\nReport saved to {REPORT_FILE}")
