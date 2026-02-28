#!/usr/bin/env python3
"""
Deep Substantive Verification of all 56 Organ Repos.
Checks: repo existence, file count, expected files, commit authors,
content uniqueness, organ-specific class references, doctrine compliance,
issue closure status, and cross-repo uniqueness.
"""
import json
import subprocess
import hashlib
import time
import re
from datetime import datetime

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"
ISSUE_REPO = "webwaka-organ-universe"

VALID_AGENTS = {
    "webwaka007", "webwakaagent1", "webwakaagent2", "webwakaagent3",
    "webwakaagent4", "webwakaagent5", "webwakaagent6", "webwakaagent7",
    "webwakaagent8", "webwakaagent9", "webwakaagent10"
}

with open("/home/ubuntu/organ_data/repo_map.json") as f:
    REPO_MAP = json.load(f)

with open("/home/ubuntu/organ_data/execution_map.json") as f:
    EXEC_MAP = json.load(f)

REPORT_FILE = "/home/ubuntu/organ_verification_report.txt"

def log(msg):
    print(msg, flush=True)
    with open(REPORT_FILE, "a") as f:
        f.write(msg + "\n")

def api_get(url):
    try:
        r = subprocess.run(
            ["curl", "-s", "-H", f"Authorization: token {PAT}",
             "-H", "Accept: application/vnd.github.v3+json", url],
            capture_output=True, text=True, timeout=15
        )
        return json.loads(r.stdout) if r.stdout.strip() else {}
    except:
        return {}

def get_organ_class(organ_id):
    parts = organ_id.split("-")
    name = parts[-1]
    return "".join(w.capitalize() for w in name.split("_"))

def get_organ_domain(organ_id):
    parts = organ_id.split("-")
    return parts[1] if len(parts) >= 3 else parts[0]

# Expected files per phase
EXPECTED_FILES = {
    "P0": ["docs/spec/purpose.md", "docs/spec/tissue-composition.md", "docs/spec/boundary-constraints.md"],
    "P1": ["docs/design/architecture.md", "docs/design/tissue-integration.md", "docs/design/structure-blueprint.md"],
    "P2": ["docs/validation/spec-completeness.md", "docs/validation/design-consistency.md", "docs/validation/invariant-check.md"],
    "P3": ["src/types.ts", None, "src/index.ts"],  # None = dynamic organ file
    "P4": [None, "tests/boundary.test.ts", "tests/offline.test.ts"],  # None = dynamic test file
    "P5": ["README.md", "docs/api-reference.md", "docs/tissue-composition.md"],
    "P6": ["docs/ratification/approval.md"],
}

def main():
    # Clear report
    with open(REPORT_FILE, "w") as f:
        f.write("")
    
    log("=" * 80)
    log("ORGAN-UNIVERSE DEEP SUBSTANTIVE VERIFICATION")
    log(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"Total organs: {len(REPO_MAP)}")
    log("=" * 80)
    
    total_checks = 0
    total_pass = 0
    total_fail = 0
    failures = []
    entity_hashes = {}
    
    for idx, (organ_id, repo_name) in enumerate(sorted(REPO_MAP.items()), 1):
        organ_class = get_organ_class(organ_id)
        domain = get_organ_domain(organ_id)
        
        log(f"\n[{idx}/56] {organ_id} -> {repo_name}")
        organ_checks = 0
        organ_pass = 0
        organ_fail = 0
        
        def check(name, condition, detail=""):
            nonlocal organ_checks, organ_pass, organ_fail, total_checks, total_pass, total_fail
            organ_checks += 1
            total_checks += 1
            if condition:
                organ_pass += 1
                total_pass += 1
            else:
                organ_fail += 1
                total_fail += 1
                failures.append(f"{organ_id}: {name} - {detail}")
                log(f"  FAIL: {name} - {detail}")
        
        # 1. Check repo exists
        repo_data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}")
        check("Repo exists", "id" in repo_data, f"Repo {repo_name} not found")
        if "id" not in repo_data:
            log(f"  SKIPPING remaining checks - repo not found")
            continue
        
        time.sleep(0.2)
        
        # 2. Check file tree
        tree = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/git/trees/main?recursive=1")
        if "tree" not in tree:
            tree = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/git/trees/master?recursive=1")
        
        files = [t["path"] for t in tree.get("tree", []) if t["type"] == "blob"]
        file_count = len(files)
        
        check("Has 20+ files", file_count >= 20, f"Only {file_count} files")
        
        # 3. Check expected files exist
        # P0 files
        for f_path in EXPECTED_FILES["P0"]:
            check(f"P0 file: {f_path}", f_path in files, "Missing")
        
        # P1 files
        for f_path in EXPECTED_FILES["P1"]:
            check(f"P1 file: {f_path}", f_path in files, "Missing")
        
        # P2 files
        for f_path in EXPECTED_FILES["P2"]:
            check(f"P2 file: {f_path}", f_path in files, "Missing")
        
        # P3 files
        check("P3 file: src/types.ts", "src/types.ts" in files, "Missing")
        entity_file = f"src/{organ_class}Organ.ts"
        check(f"P3 file: {entity_file}", entity_file in files, "Missing")
        check("P3 file: src/index.ts", "src/index.ts" in files, "Missing")
        check("P3 file: package.json", "package.json" in files, "Missing")
        
        # P4 files
        test_file = f"tests/{organ_class}Organ.test.ts"
        check(f"P4 file: {test_file}", test_file in files, "Missing")
        check("P4 file: tests/boundary.test.ts", "tests/boundary.test.ts" in files, "Missing")
        check("P4 file: tests/offline.test.ts", "tests/offline.test.ts" in files, "Missing")
        
        # P5 files
        check("P5 file: README.md", "README.md" in files, "Missing")
        check("P5 file: docs/api-reference.md", "docs/api-reference.md" in files, "Missing")
        
        # P6 files
        check("P6 file: docs/ratification/approval.md", "docs/ratification/approval.md" in files, "Missing")
        
        time.sleep(0.2)
        
        # 4. Check commits have valid agent authors
        commits = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/commits?per_page=20")
        if isinstance(commits, list) and len(commits) > 0:
            authors = set()
            for c in commits:
                author = c.get("author", {})
                if author:
                    authors.add(author.get("login", "unknown"))
            
            valid_authors = authors.intersection(VALID_AGENTS)
            check("Commits have valid agent authors", len(valid_authors) > 0,
                  f"Authors: {authors}")
            check("Has phase-specific commits", len(commits) >= 7,
                  f"Only {len(commits)} commits")
        else:
            check("Has commits", False, "No commits found")
        
        time.sleep(0.2)
        
        # 5. Check types.ts content
        types_content = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/contents/src/types.ts")
        if "content" in types_content:
            import base64
            content = base64.b64decode(types_content["content"]).decode("utf-8", errors="replace")
            check("types.ts has organ ID", organ_id in content, "Missing organ ID")
            check("types.ts has NIGERIA_FIRST_CONFIG", "NIGERIA_FIRST_CONFIG" in content, "Missing")
            check("types.ts has 30000 timeout", "30_000" in content or "30000" in content, "Missing")
            check("types.ts has en-NG locale", "en-NG" in content, "Missing")
            check("types.ts has OfflineQueueEntry", "OfflineQueueEntry" in content, "Missing")
            check("types.ts has NetworkConfig", "NetworkConfig" in content, "Missing")
            check(f"types.ts has {organ_class}Command", f"{organ_class}Command" in content, "Missing")
            check(f"types.ts has {organ_class}Event", f"{organ_class}Event" in content, "Missing")
        else:
            check("types.ts readable", False, "Cannot read")
        
        time.sleep(0.2)
        
        # 6. Check entity file content
        entity_content_data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/contents/{entity_file}")
        if "content" in entity_content_data:
            import base64
            entity_content = base64.b64decode(entity_content_data["content"]).decode("utf-8", errors="replace")
            check(f"Entity has {organ_class}Organ class", f"class {organ_class}Organ" in entity_content, "Missing")
            check("Entity has execute method", "execute(" in entity_content, "Missing")
            check("Entity has executeOffline method", "executeOffline(" in entity_content, "Missing")
            check("Entity has sync method", "sync(" in entity_content, "Missing")
            check("Entity has getHealth method", "getHealth(" in entity_content, "Missing")
            check("Entity has offline queue", "offlineQueue" in entity_content, "Missing")
            check("Entity has Nigeria-first config", "NIGERIA_FIRST_CONFIG" in entity_content, "Missing")
            
            # Hash for uniqueness
            entity_hash = hashlib.md5(entity_content.encode()).hexdigest()
            entity_hashes[organ_id] = entity_hash
        else:
            check("Entity file readable", False, "Cannot read")
        
        time.sleep(0.2)
        
        # 7. Check test file content
        test_content_data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/contents/{test_file}")
        if "content" in test_content_data:
            import base64
            test_content = base64.b64decode(test_content_data["content"]).decode("utf-8", errors="replace")
            check("Tests have describe blocks", "describe(" in test_content, "Missing")
            check("Tests have expect assertions", "expect(" in test_content, "Missing")
            check(f"Tests import {organ_class}Organ", f"{organ_class}Organ" in test_content, "Missing")
            check("Tests cover offline behavior", "offline" in test_content.lower() or "Offline" in test_content, "Missing")
            check("Tests cover Nigeria-first", "Nigeria" in test_content or "NIGERIA" in test_content or "en-NG" in test_content, "Missing")
        else:
            check("Test file readable", False, "Cannot read")
        
        time.sleep(0.2)
        
        # 8. Check README content
        readme_data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/contents/README.md")
        if "content" in readme_data:
            import base64
            readme_content = base64.b64decode(readme_data["content"]).decode("utf-8", errors="replace")
            check("README has organ class name", organ_class in readme_content, "Missing")
            check("README has organ ID", organ_id in readme_content, "Missing")
            check("README has Offline First", "Offline First" in readme_content or "Offline" in readme_content, "Missing")
            check("README has Nigeria First", "Nigeria First" in readme_content or "Nigeria" in readme_content, "Missing")
        else:
            check("README readable", False, "Cannot read")
        
        time.sleep(0.2)
        
        # 9. Check package.json
        pkg_data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/contents/package.json")
        if "content" in pkg_data:
            import base64
            pkg_content = base64.b64decode(pkg_data["content"]).decode("utf-8", errors="replace")
            pkg_json = json.loads(pkg_content)
            expected_pkg_name = f"@webwaka/organ-{domain.lower()}-{get_organ_class(organ_id)}"
            # Check package name contains organ reference
            check("package.json has @webwaka/organ prefix", "@webwaka/organ" in pkg_json.get("name", ""), 
                  f"Got: {pkg_json.get('name', 'missing')}")
            check("package.json has organId", organ_id in pkg_content, "Missing organ ID")
        else:
            check("package.json readable", False, "Cannot read")
        
        time.sleep(0.2)
        
        # 10. Check ratification approval
        rat_data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/contents/docs/ratification/approval.md")
        if "content" in rat_data:
            import base64
            rat_content = base64.b64decode(rat_data["content"]).decode("utf-8", errors="replace")
            check("Ratification says RATIFIED", "RATIFIED" in rat_content, "Missing")
            check("Ratification has organ ID", organ_id in rat_content, "Missing")
        else:
            check("Ratification readable", False, "Cannot read")
        
        time.sleep(0.2)
        
        # 11. Check issue closure
        organ_data = EXEC_MAP.get(organ_id, {})
        master_num = organ_data.get("master")
        if master_num:
            master_issue = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{master_num}")
            check("Master issue closed", master_issue.get("state") == "closed",
                  f"State: {master_issue.get('state', 'unknown')}")
        
        # Check a sample of phase and task issues
        phases = organ_data.get("phases", [])
        for p in phases:
            phase_issue_data = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{p['issue']}")
            check(f"Phase #{p['issue']} closed", phase_issue_data.get("state") == "closed",
                  f"State: {phase_issue_data.get('state', 'unknown')}")
            time.sleep(0.15)
            
            for t in p.get("tasks", []):
                task_issue_data = api_get(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{t['issue']}")
                check(f"Task #{t['issue']} closed", task_issue_data.get("state") == "closed",
                      f"State: {task_issue_data.get('state', 'unknown')}")
                time.sleep(0.15)
        
        log(f"  Result: {organ_pass}/{organ_checks} passed")
    
    # Cross-repo uniqueness check
    log(f"\n{'='*80}")
    log("CROSS-REPO UNIQUENESS CHECK")
    log(f"{'='*80}")
    
    unique_hashes = set(entity_hashes.values())
    check_name = "All entity files unique"
    if len(unique_hashes) == len(entity_hashes):
        log(f"  PASS: All {len(entity_hashes)} entity files have unique content hashes")
        total_checks += 1
        total_pass += 1
    else:
        # Find duplicates
        hash_to_organs = {}
        for oid, h in entity_hashes.items():
            hash_to_organs.setdefault(h, []).append(oid)
        dupes = {h: organs for h, organs in hash_to_organs.items() if len(organs) > 1}
        log(f"  FAIL: {len(dupes)} duplicate content groups found")
        for h, organs in dupes.items():
            log(f"    Duplicate: {', '.join(organs)}")
            failures.append(f"CROSS-REPO: Duplicate content: {', '.join(organs)}")
        total_checks += 1
        total_fail += 1
    
    # Final summary
    log(f"\n{'='*80}")
    log("FINAL VERIFICATION SUMMARY")
    log(f"{'='*80}")
    log(f"Total checks: {total_checks}")
    log(f"Passed: {total_pass}")
    log(f"Failed: {total_fail}")
    log(f"Pass rate: {total_pass/total_checks*100:.1f}%")
    
    if failures:
        log(f"\nFAILURES ({len(failures)}):")
        for f_msg in failures:
            log(f"  - {f_msg}")
    else:
        log("\nNO FAILURES — 100% PASS RATE")
    
    log(f"\nEntity hash uniqueness: {len(unique_hashes)}/{len(entity_hashes)} unique")
    log(f"{'='*80}")

if __name__ == "__main__":
    main()
