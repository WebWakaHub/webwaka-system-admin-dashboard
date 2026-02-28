#!/usr/bin/env python3
"""
Deep substantive verification of all 10 tissue repos.
Checks: repo existence, file count, file content, commit authors, issue states,
agent compliance, cross-repo uniqueness, doctrine enforcement.
"""
import json
import subprocess
import time
import hashlib

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"
ISSUE_REPO = "webwaka-tissue-universe"

TISSUES = {
    "TIS-CMDCOORD": {"repo": "webwaka-tissue-cmd-coord", "class": "CommandCoordinator", "full_id": "TIS-CMDCOORD-v0.1.0", "kebab": "cmd-coord", "cells": ["CEL-CMDPROCESS", "CEL-CMDVALIDATE", "CEL-CMDROUTER"], "classification": "Cross-Functional"},
    "TIS-STATEAGG": {"repo": "webwaka-tissue-state-agg", "class": "StateAggregator", "full_id": "TIS-STATEAGG-v0.1.0", "kebab": "state-agg", "cells": ["CEL-STATESTORE", "CEL-STATESYNC", "CEL-STATEMERGE"], "classification": "Cross-Functional"},
    "TIS-WORKFLOW": {"repo": "webwaka-tissue-workflow", "class": "WorkflowTissue", "full_id": "TIS-WORKFLOW-v0.1.0", "kebab": "workflow", "cells": ["CEL-WORKFLOW", "CEL-STATESTORE", "CEL-EVENTBUS"], "classification": "Lifecycle"},
    "TIS-POLICY": {"repo": "webwaka-tissue-policy", "class": "PolicyTissue", "full_id": "TIS-POLICY-v0.1.0", "kebab": "policy", "cells": ["CEL-POLICYEVAL", "CEL-POLICYSTORE", "CEL-AUDITLOG"], "classification": "Structural Boundary"},
    "TIS-EVENT": {"repo": "webwaka-tissue-event", "class": "EventTissue", "full_id": "TIS-EVENT-v0.1.0", "kebab": "event", "cells": ["CEL-EVENTBUS", "CEL-EVENTSTORE", "CEL-EVENTROUTER"], "classification": "Cross-Functional"},
    "TIS-VALIDATE": {"repo": "webwaka-tissue-validate", "class": "ValidationTissue", "full_id": "TIS-VALIDATE-v0.1.0", "kebab": "validate", "cells": ["CEL-VALIDATOR", "CEL-SCHEMASTORE", "CEL-INVARIANTCHECK"], "classification": "Structural Boundary"},
    "TIS-RESOURCE": {"repo": "webwaka-tissue-resource", "class": "ResourceTissue", "full_id": "TIS-RESOURCE-v0.1.0", "kebab": "resource", "cells": ["CEL-RESOURCEPOOL", "CEL-RESOURCEALLOC", "CEL-RESOURCEMON"], "classification": "Scale & Deployment"},
    "TIS-MONITOR": {"repo": "webwaka-tissue-monitor", "class": "MonitorTissue", "full_id": "TIS-MONITOR-v0.1.0", "kebab": "monitor", "cells": ["CEL-HEALTHCHECK", "CEL-METRICS", "CEL-ALERTING"], "classification": "Scale & Deployment"},
    "TIS-AI-COGNITIVE_TISSUE": {"repo": "webwaka-tissue-ai-cognitive", "class": "CognitiveTissue", "full_id": "TIS-AI-COGNITIVE_TISSUE-v0.1.0", "kebab": "ai-cognitive", "cells": ["CEL-AI-COGNITIVE_CELL", "CEL-AI-INFERENCE_CELL", "CEL-AI-STREAMING_CELL"], "classification": "Cross-Functional"},
    "TIS-AI-ENTITLEMENT_TISSUE": {"repo": "webwaka-tissue-ai-entitlement", "class": "EntitlementTissue", "full_id": "TIS-AI-ENTITLEMENT_TISSUE-v0.1.0", "kebab": "ai-entitlement", "cells": ["CEL-AI-COGNITIVE_CELL", "CEL-POLICYEVAL", "CEL-AUDITLOG"], "classification": "Structural Boundary"},
}

# Load execution map for issue numbers
with open("/home/ubuntu/tissue_data/execution_map.json") as f:
    EXEC_MAP = json.load(f)

VALID_AGENTS = {"webwaka007", "webwakaagent1", "webwakaagent2", "webwakaagent3", 
                "webwakaagent4", "webwakaagent5", "webwakaagent6", "webwakaagent7",
                "webwakaagent8", "webwakaagent9", "webwakaagent10"}

EXPECTED_FILES = [
    "docs/spec/specification.md",
    "docs/spec/interface-contract.md",
    "docs/spec/spec-validation.md",
    "docs/design/architecture.md",
    "docs/design/dependency-graph.md",
    "docs/design/design-review.md",
    "docs/validation/spec-completeness.md",
    "docs/validation/design-consistency.md",
    "docs/validation/invariant-check.md",
    "src/types.ts",
    "src/entity.ts",
    "package.json",
    "tests/unit.test.ts",
    "tests/integration.test.ts",
    "tests/coverage.test.ts",
    "README.md",
    "docs/api-reference.md",
    "docs/operations-guide.md",
    "ratification/review.md",
    "ratification/compliance.md",
    "ratification/approval.md",
]

def api_get(url):
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {PAT}", url],
        capture_output=True, text=True, timeout=15)
    try:
        return json.loads(result.stdout)
    except:
        return {}

def get_file_content(repo, path):
    """Get file content from GitHub API."""
    import base64
    data = api_get(f"https://api.github.com/repos/{ORG}/{repo}/contents/{path}")
    if "content" in data:
        return base64.b64decode(data["content"]).decode("utf-8", errors="replace")
    return None

total_pass = 0
total_fail = 0
failures = []
entity_hashes = {}

report = []

def check(desc, condition, detail=""):
    global total_pass, total_fail
    if condition:
        total_pass += 1
        return True
    else:
        total_fail += 1
        failures.append(f"{desc}: {detail}")
        return False

for tissue_id, tdef in TISSUES.items():
    repo = tdef["repo"]
    cn = tdef["class"]
    fid = tdef["full_id"]
    kebab = tdef["kebab"]
    exec_data = EXEC_MAP[tissue_id]
    
    report.append(f"\n{'='*60}")
    report.append(f"TISSUE: {tissue_id} ({cn})")
    report.append(f"Repo: {repo}")
    report.append(f"{'='*60}")
    
    # 1. Repo exists
    repo_data = api_get(f"https://api.github.com/repos/{ORG}/{repo}")
    check(f"{tissue_id}: Repo exists", "id" in repo_data, "Repo not found")
    
    # 2. File tree
    tree_data = api_get(f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1")
    tree_files = [x["path"] for x in tree_data.get("tree", []) if x.get("type") == "blob"]
    file_count = len(tree_files)
    check(f"{tissue_id}: Has 21 files", file_count == 21, f"Has {file_count} files")
    
    # 3. Expected files exist
    for expected_file in EXPECTED_FILES:
        check(f"{tissue_id}: {expected_file} exists", expected_file in tree_files, "Missing")
    
    # 4. Commit log has valid agents
    commits_data = api_get(f"https://api.github.com/repos/{ORG}/{repo}/commits?per_page=30")
    if isinstance(commits_data, list):
        for commit in commits_data:
            author = commit.get("author", {})
            author_login = author.get("login", "") if author else ""
            check(f"{tissue_id}: Commit author valid", author_login in VALID_AGENTS or author_login == "", 
                  f"Invalid author: {author_login}")
    
    # 5. types.ts content checks
    types_content = get_file_content(repo, "src/types.ts")
    if types_content:
        check(f"{tissue_id}: types.ts has tissue ID", fid in types_content, "Missing tissue ID")
        check(f"{tissue_id}: types.ts has OfflineQueueEntry", "OfflineQueueEntry" in types_content, "Missing OfflineQueueEntry")
        check(f"{tissue_id}: types.ts has NetworkConfig", "NetworkConfig" in types_content, "Missing NetworkConfig")
        check(f"{tissue_id}: types.ts has NIGERIA_FIRST_CONFIG", "NIGERIA_FIRST_CONFIG" in types_content, "Missing NIGERIA_FIRST_CONFIG")
        check(f"{tissue_id}: types.ts has 30_000 timeout", "30_000" in types_content or "30000" in types_content, "Missing 30s timeout")
        check(f"{tissue_id}: types.ts has en-NG locale", "en-NG" in types_content, "Missing en-NG locale")
        check(f"{tissue_id}: types.ts has CoordinationRequest", "CoordinationRequest" in types_content, "Missing CoordinationRequest")
    else:
        check(f"{tissue_id}: types.ts readable", False, "Could not read")
    
    # 6. entity.ts content checks
    entity_content = get_file_content(repo, "src/entity.ts")
    if entity_content:
        check(f"{tissue_id}: entity.ts has class {cn}", f"class {cn}" in entity_content, f"Missing class {cn}")
        check(f"{tissue_id}: entity.ts has coordinate method", "coordinate(" in entity_content, "Missing coordinate method")
        check(f"{tissue_id}: entity.ts has coordinateOffline", "coordinateOffline" in entity_content, "Missing coordinateOffline")
        check(f"{tissue_id}: entity.ts has sync method", "sync(" in entity_content, "Missing sync method")
        check(f"{tissue_id}: entity.ts has getHealth", "getHealth" in entity_content, "Missing getHealth")
        check(f"{tissue_id}: entity.ts has offline queue", "offlineQueue" in entity_content, "Missing offline queue")
        check(f"{tissue_id}: entity.ts has Nigeria-first", "NIGERIA_FIRST" in entity_content, "Missing Nigeria-first")
        
        # Cross-repo uniqueness
        entity_hash = hashlib.md5(entity_content.encode()).hexdigest()
        entity_hashes[tissue_id] = entity_hash
    else:
        check(f"{tissue_id}: entity.ts readable", False, "Could not read")
    
    # 7. Test files content checks
    unit_test = get_file_content(repo, "tests/unit.test.ts")
    if unit_test:
        check(f"{tissue_id}: unit test has describe", "describe(" in unit_test, "Missing describe")
        check(f"{tissue_id}: unit test has expect", "expect(" in unit_test, "Missing expect")
        check(f"{tissue_id}: unit test has class import", cn in unit_test, f"Missing {cn} import")
        check(f"{tissue_id}: unit test has offline test", "offline" in unit_test.lower() or "Offline" in unit_test, "Missing offline test")
        check(f"{tissue_id}: unit test has Nigeria-first test", "nigeria" in unit_test.lower() or "Nigeria" in unit_test, "Missing Nigeria test")
    else:
        check(f"{tissue_id}: unit test readable", False, "Could not read")
    
    # 8. package.json checks
    pkg_content = get_file_content(repo, "package.json")
    if pkg_content:
        pkg = json.loads(pkg_content)
        check(f"{tissue_id}: package.json name correct", pkg.get("name") == f"@webwaka/tissue-{kebab}", 
              f"Got {pkg.get('name')}, expected @webwaka/tissue-{kebab}")
    else:
        check(f"{tissue_id}: package.json readable", False, "Could not read")
    
    # 9. README checks
    readme_content = get_file_content(repo, "README.md")
    if readme_content:
        check(f"{tissue_id}: README has class name", cn in readme_content, f"Missing {cn}")
        check(f"{tissue_id}: README has tissue ID", fid in readme_content, "Missing tissue ID")
        check(f"{tissue_id}: README has Offline First", "Offline First" in readme_content, "Missing Offline First")
        check(f"{tissue_id}: README has Nigeria First", "Nigeria First" in readme_content, "Missing Nigeria First")
    else:
        check(f"{tissue_id}: README readable", False, "Could not read")
    
    # 10. Ratification approval checks
    approval_content = get_file_content(repo, "ratification/approval.md")
    if approval_content:
        check(f"{tissue_id}: Approval says RATIFIED", "RATIFIED" in approval_content, "Missing RATIFIED")
        check(f"{tissue_id}: Approval has tissue ID", fid in approval_content, "Missing tissue ID")
    else:
        check(f"{tissue_id}: Approval readable", False, "Could not read")
    
    # 11. Issue state checks
    master_num = exec_data["master"]
    master_data = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{master_num}")
    check(f"{tissue_id}: Master #{master_num} closed", master_data.get("state") == "closed", 
          f"State: {master_data.get('state')}")
    
    for phase_data in exec_data["phases"]:
        phase_num = phase_data["phase_num"]
        phase_issue = phase_data["issue"]
        phase_state = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{phase_issue}")
        check(f"{tissue_id}: P{phase_num} #{phase_issue} closed", phase_state.get("state") == "closed",
              f"State: {phase_state.get('state')}")
        
        for task_data in phase_data["tasks"]:
            task_issue = task_data["issue"]
            task_state = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{task_issue}")
            check(f"{tissue_id}: P{phase_num}-T{task_data['task_num']:02d} #{task_issue} closed", 
                  task_state.get("state") == "closed",
                  f"State: {task_state.get('state')}")
            
            # Check completion comment exists
            comments = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{task_issue}/comments")
            if isinstance(comments, list):
                check(f"{tissue_id}: P{phase_num}-T{task_data['task_num']:02d} has comment",
                      len(comments) > 0, "No completion comment")
            
            time.sleep(0.1)
    
    report.append(f"  Checks so far: {total_pass} pass, {total_fail} fail")
    print(f"{tissue_id}: {total_pass} pass, {total_fail} fail")

# Cross-repo uniqueness check
unique_hashes = set(entity_hashes.values())
check("CROSS-REPO: All entity files unique", len(unique_hashes) == len(entity_hashes),
      f"Only {len(unique_hashes)} unique out of {len(entity_hashes)}")

# Write report
with open("/home/ubuntu/tissue_verification_report.txt", "w") as f:
    f.write("TISSUE-UNIVERSE DEEP SUBSTANTIVE VERIFICATION REPORT\n")
    f.write(f"{'='*60}\n\n")
    f.write(f"Total Checks: {total_pass + total_fail}\n")
    f.write(f"Passed: {total_pass}\n")
    f.write(f"Failed: {total_fail}\n")
    f.write(f"Pass Rate: {total_pass/(total_pass+total_fail)*100:.1f}%\n\n")
    
    if failures:
        f.write("FAILURES:\n")
        for fail in failures:
            f.write(f"  - {fail}\n")
    else:
        f.write("NO FAILURES — 100% PASS RATE\n")
    
    f.write("\n")
    for line in report:
        f.write(f"{line}\n")
    
    f.write(f"\n\nCROSS-REPO UNIQUENESS:\n")
    for tid, h in entity_hashes.items():
        f.write(f"  {tid}: {h}\n")

print(f"\n{'#'*60}")
print(f"FINAL RESULT: {total_pass} pass, {total_fail} fail ({total_pass/(total_pass+total_fail)*100:.1f}%)")
if failures:
    print(f"\nFAILURES ({len(failures)}):")
    for f in failures:
        print(f"  - {f}")
else:
    print("NO FAILURES — 100% PASS RATE")
print(f"{'#'*60}")
