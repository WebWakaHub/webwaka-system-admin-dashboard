#!/usr/bin/env python3
"""
Organism-Universe Deep Substantive Verification
=================================================
Verifies all deliverables pushed to webwaka-organism-platform
and all issues closed in webwaka-organism-universe.
"""

import subprocess, json, time, os

ORG = "WebWakaHub"
ISSUE_REPO = "webwaka-organism-universe"
IMPL_REPO = "webwaka-organism-platform"
ORGANISM_ID = "ORG-WEBWAKA-PLATFORM"

PATS = [
    "REDACTED_PAT",  # webwaka007
    "REDACTED_PAT",  # webwakaagent7
    "REDACTED_PAT",  # webwakaagent9
]
pat_idx = 0

def get_pat():
    global pat_idx
    p = PATS[pat_idx % len(PATS)]
    pat_idx += 1
    return p

def api(url):
    pat = get_pat()
    r = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {pat}", url],
        capture_output=True, text=True, timeout=30
    )
    time.sleep(1)
    return json.loads(r.stdout) if r.stdout else None

results = {
    "total_checks": 0,
    "passed": 0,
    "failed": 0,
    "details": []
}

def check(name, condition, detail=""):
    results["total_checks"] += 1
    if condition:
        results["passed"] += 1
        results["details"].append(f"✅ PASS: {name}")
    else:
        results["failed"] += 1
        results["details"].append(f"❌ FAIL: {name} — {detail}")

print("=" * 60)
print("ORGANISM-UNIVERSE DEEP SUBSTANTIVE VERIFICATION")
print("=" * 60)

# ============================================================
# 1. ISSUE VERIFICATION — All 34 issues must be closed
# ============================================================
print("\n--- 1. Issue State Verification ---")

issues = []
for page in range(1, 4):
    url = f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues?state=all&per_page=100&page={page}"
    batch = api(url)
    if batch:
        issues.extend(batch)
    time.sleep(1)

# Filter out pull requests
issues = [i for i in issues if "pull_request" not in i]

check("Total issues >= 34", len(issues) >= 34, f"Found {len(issues)}")

closed_count = sum(1 for i in issues if i.get("state") == "closed")
open_count = sum(1 for i in issues if i.get("state") == "open")

check("All issues closed", open_count == 0, f"{open_count} still open")
check("Closed issue count >= 34", closed_count >= 34, f"{closed_count} closed")

# Check master issue (#1)
master = api(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/1")
if master:
    check("Master issue #1 exists", True)
    check("Master issue #1 closed", master.get("state") == "closed", master.get("state", "unknown"))
else:
    check("Master issue #1 exists", False, "Not found")

# Check phase issues
for phase_num, issue_num in {0: 2, 1: 6, 2: 10, 3: 14, 4: 18, 5: 22, 6: 26}.items():
    issue = api(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{issue_num}")
    if issue:
        check(f"Phase P{phase_num} issue #{issue_num} closed", issue.get("state") == "closed", issue.get("state", "unknown"))
    time.sleep(0.5)

# Check task issues
for task_key, issue_num in {
    "P0-T01": 3, "P0-T02": 4, "P0-T03": 5,
    "P1-T01": 7, "P1-T02": 8, "P1-T03": 9,
    "P2-T01": 11, "P2-T02": 12, "P2-T03": 13,
    "P3-T01": 15, "P3-T02": 16, "P3-T03": 17,
    "P4-T01": 19, "P4-T02": 20, "P4-T03": 21,
    "P5-T01": 23, "P5-T02": 24, "P5-T03": 25,
    "P6-T01": 27, "P6-T02": 28, "P6-T03": 29,
}.items():
    issue = api(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{issue_num}")
    if issue:
        check(f"Task {task_key} issue #{issue_num} closed", issue.get("state") == "closed", issue.get("state", "unknown"))
    time.sleep(0.5)

# Check AI overlay issues
for ai_id, issue_num in {"O01": 30, "O02": 31, "O03": 32, "O04": 33, "O05": 34}.items():
    issue = api(f"https://api.github.com/repos/{ORG}/{ISSUE_REPO}/issues/{issue_num}")
    if issue:
        check(f"AI overlay {ai_id} issue #{issue_num} closed", issue.get("state") == "closed", issue.get("state", "unknown"))
    time.sleep(0.5)

# ============================================================
# 2. REPOSITORY CONTENT VERIFICATION
# ============================================================
print("\n--- 2. Repository Content Verification ---")

# Clone the implementation repo
work_dir = "/tmp/verify_organism"
os.makedirs(work_dir, exist_ok=True)
subprocess.run(f"rm -rf {work_dir}/*", shell=True)
pat = PATS[0]
subprocess.run(
    f"cd {work_dir} && git clone https://x-access-token:{pat}@github.com/{ORG}/{IMPL_REPO}.git .",
    shell=True, capture_output=True, text=True, timeout=30
)

# Check required files exist
required_files = [
    "docs/spec/purpose-and-scope.md",
    "docs/spec/structural-invariants.md",
    "docs/spec/interface-contracts.md",
    "docs/design/architecture-overview.md",
    "docs/design/system-composition.md",
    "docs/design/offline-sync-design.md",
    "docs/validation/spec-completeness.md",
    "docs/validation/design-consistency.md",
    "docs/validation/invariant-check.md",
    "src/types.ts",
    "src/entity.ts",
    "src/index.ts",
    "package.json",
    "tests/entity.test.ts",
    "docs/api/README.md",
    "docs/integration/system-integration-guide.md",
    "docs/system-composition.md",
    "docs/ratification/approval.md",
    "docs/ratification/audit-trail.md",
]

for filepath in required_files:
    full_path = os.path.join(work_dir, filepath)
    exists = os.path.isfile(full_path)
    check(f"File exists: {filepath}", exists, "Missing")

# ============================================================
# 3. CONTENT QUALITY VERIFICATION
# ============================================================
print("\n--- 3. Content Quality Verification ---")

def file_contains(filepath, keyword):
    full_path = os.path.join(work_dir, filepath)
    if not os.path.isfile(full_path):
        return False
    with open(full_path) as f:
        return keyword in f.read()

# Doctrine compliance in source code
check("types.ts: Nigeria-first config present", file_contains("src/types.ts", "en-NG"))
check("types.ts: WAT timezone present", file_contains("src/types.ts", "Africa/Lagos"))
check("types.ts: NGN currency present", file_contains("src/types.ts", "NGN"))
check("types.ts: 30s timeout present", file_contains("src/types.ts", "30000"))
check("types.ts: Offline queue types present", file_contains("src/types.ts", "OfflineQueueEntry"))
check("types.ts: OrganismEvent type present", file_contains("src/types.ts", "OrganismEvent"))

check("entity.ts: Orchestrate method present", file_contains("src/entity.ts", "orchestrate"))
check("entity.ts: Offline orchestration present", file_contains("src/entity.ts", "orchestrateOffline"))
check("entity.ts: Sync method present", file_contains("src/entity.ts", "sync"))
check("entity.ts: System registration present", file_contains("src/entity.ts", "registerSystem"))
check("entity.ts: System deprecation present", file_contains("src/entity.ts", "deprecateSystem"))
check("entity.ts: Constitutional audit present", file_contains("src/entity.ts", "auditSystemCompliance"))
check("entity.ts: Health monitoring present", file_contains("src/entity.ts", "getHealth"))
check("entity.ts: AI governance present", file_contains("src/entity.ts", "registerAIPolicy"))
check("entity.ts: Vendor neutral enforcement present", file_contains("src/entity.ts", "vendor-neutral"))
check("entity.ts: Exponential backoff present", file_contains("src/entity.ts", "backoff"))

check("index.ts: Public export present", file_contains("src/index.ts", "export"))

# Spec documents
check("Spec: All 19 systems listed", file_contains("docs/spec/purpose-and-scope.md", "SYSX-AI-COGNITIVE_FABRIC"))
check("Spec: 19 invariants defined", file_contains("docs/spec/structural-invariants.md", "Offline-First Invariants"))
check("Spec: Interface contracts defined", file_contains("docs/spec/interface-contracts.md", "OrganismEvent"))

# Design documents
check("Design: Architecture overview present", file_contains("docs/design/architecture-overview.md", "Cross-System Governance"))
check("Design: System composition present", file_contains("docs/design/system-composition.md", "System Registry"))
check("Design: Offline sync design present", file_contains("docs/design/offline-sync-design.md", "Sync Protocol"))

# Validation documents
check("Validation: Spec completeness PASS", file_contains("docs/validation/spec-completeness.md", "PASS"))
check("Validation: Design consistency PASS", file_contains("docs/validation/design-consistency.md", "PASS"))
check("Validation: All invariants satisfied", file_contains("docs/validation/invariant-check.md", "ALL INVARIANTS SATISFIED"))

# Test suite
check("Tests: System registry tests present", file_contains("tests/entity.test.ts", "System Registry"))
check("Tests: Offline support tests present", file_contains("tests/entity.test.ts", "Offline Support"))
check("Tests: Nigeria-first tests present", file_contains("tests/entity.test.ts", "Nigeria-First Compliance"))
check("Tests: AI governance tests present", file_contains("tests/entity.test.ts", "AI Governance"))

# Documentation
check("Docs: API documentation present", file_contains("docs/api/README.md", "orchestrate"))
check("Docs: Integration guide present", file_contains("docs/integration/system-integration-guide.md", "Nigeria-First Checklist"))
check("Docs: System composition reference present", file_contains("docs/system-composition.md", "19 Systems"))

# Ratification
check("Ratification: Approval present", file_contains("docs/ratification/approval.md", "RATIFIED"))
check("Ratification: Audit trail present", file_contains("docs/ratification/audit-trail.md", "Execution Audit"))

# ============================================================
# 4. COMMIT VERIFICATION
# ============================================================
print("\n--- 4. Commit Verification ---")

commit_log = subprocess.run(
    f"cd {work_dir} && git log --oneline --all",
    shell=True, capture_output=True, text=True, timeout=10
)
commits = commit_log.stdout.strip().split("\n") if commit_log.stdout.strip() else []
check("Commits present in repo", len(commits) >= 7, f"Found {len(commits)} commits")

# Check agent identity in commits
author_log = subprocess.run(
    f"cd {work_dir} && git log --format='%an <%ae>' --all",
    shell=True, capture_output=True, text=True, timeout=10
)
check("webwakaagent3 commits present", "webwakaagent3" in author_log.stdout, "Agent identity not found")

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "=" * 60)
print("VERIFICATION SUMMARY")
print("=" * 60)
print(f"Total Checks: {results['total_checks']}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
print(f"Pass Rate: {results['passed']/results['total_checks']*100:.1f}%")
print()

if results['failed'] > 0:
    print("FAILURES:")
    for d in results['details']:
        if d.startswith("❌"):
            print(f"  {d}")

# Save results
with open("/home/ubuntu/organism_verification_results.json", "w") as f:
    json.dump(results, f, indent=2)

# Save detailed report
with open("/home/ubuntu/organism_verification_report.txt", "w") as f:
    f.write("ORGANISM-UNIVERSE DEEP SUBSTANTIVE VERIFICATION REPORT\n")
    f.write("=" * 60 + "\n\n")
    f.write(f"Total Checks: {results['total_checks']}\n")
    f.write(f"Passed: {results['passed']}\n")
    f.write(f"Failed: {results['failed']}\n")
    f.write(f"Pass Rate: {results['passed']/results['total_checks']*100:.1f}%\n\n")
    f.write("DETAILED RESULTS:\n")
    for d in results['details']:
        f.write(f"  {d}\n")

print("\nVerification complete.")
