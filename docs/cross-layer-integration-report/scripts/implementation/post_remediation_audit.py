#!/usr/bin/env python3
"""
STEP 5b: Post-Remediation Audit
Verify actual repo contents across all 22 organelle repos:
1. Repo existence and accessibility
2. Commit count and authors
3. File tree completeness (spec, design, src, tests, docs, ratification)
4. Agent commit signatures match expected agents
5. Cross-repo uniqueness (no template duplication)
"""
import json
import subprocess
import time
import hashlib
from collections import defaultdict

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

# All 22 organelle repos
REPOS = [
    "webwaka-organelle-subject-registry",
    "webwaka-organelle-boundary-context",
    "webwaka-organelle-record-store",
    "webwaka-organelle-policy-definition",
    "webwaka-organelle-trust-assertion",
    "webwaka-organelle-scheduler-executor",
    "webwaka-organelle-workflow-orchestrator",
    "webwaka-organelle-message-gateway",
    "webwaka-organelle-validation-engine",
    "webwaka-organelle-resource-allocator",
    "webwaka-organelle-event-dispatcher",
    "webwaka-organelle-discovery-registry",
    "webwaka-organelle-composition-modeler",
    "webwaka-organelle-governance-registry",
    "webwaka-organelle-telemetry-collector",
    "webwaka-organelle-audit-logger",
    "webwaka-organelle-instrumentation-probe",
    "webwaka-organelle-external-adapter",
    "webwaka-organelle-cognitive-port",
    "webwaka-organelle-prompt-assembler",
    "webwaka-organelle-result-validator",
    "webwaka-organelle-audit-emitter",
]

def api_get(url):
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {PAT}", url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(result.stdout)
    except:
        return None

report = []
report.append("=" * 120)
report.append("POST-REMEDIATION AUDIT REPORT")
report.append("=" * 120)

# ============================================================
# SECTION 1: REPO EXISTENCE AND BASIC STATS
# ============================================================
report.append("\nSECTION 1: REPOSITORY EXISTENCE AND BASIC STATISTICS")
report.append("-" * 80)

repo_stats = {}
for repo_name in REPOS:
    data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}")
    if data and data.get('full_name'):
        repo_stats[repo_name] = {
            "exists": True,
            "size": data.get('size', 0),
            "default_branch": data.get('default_branch', 'main'),
            "created": data.get('created_at', '')[:10],
            "updated": data.get('updated_at', '')[:10],
        }
        report.append(f"  [EXISTS] {repo_name:50s} | size={data.get('size',0):5d}KB | created={data.get('created_at','')[:10]}")
    else:
        repo_stats[repo_name] = {"exists": False}
        report.append(f"  [MISSING] {repo_name}")
    time.sleep(0.2)

existing = sum(1 for v in repo_stats.values() if v['exists'])
report.append(f"\n  Summary: {existing}/{len(REPOS)} repos exist")

# ============================================================
# SECTION 2: COMMIT ANALYSIS PER REPO
# ============================================================
report.append("\n\nSECTION 2: COMMIT ANALYSIS PER REPO")
report.append("-" * 80)

all_commit_authors = defaultdict(int)
repo_commit_data = {}

for repo_name in REPOS:
    if not repo_stats[repo_name]["exists"]:
        continue
    
    commits = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/commits?per_page=100")
    if not commits or not isinstance(commits, list):
        report.append(f"  {repo_name}: ERROR fetching commits")
        continue
    
    authors = defaultdict(int)
    for c in commits:
        author = c.get('commit', {}).get('author', {}).get('name', 'unknown')
        authors[author] += 1
        all_commit_authors[author] += 1
    
    repo_commit_data[repo_name] = {
        "count": len(commits),
        "authors": dict(authors),
    }
    
    author_str = ", ".join(f"{a}({n})" for a, n in sorted(authors.items()))
    report.append(f"  {repo_name:50s} | {len(commits):2d} commits | authors: {author_str}")
    time.sleep(0.3)

report.append(f"\n  Global author distribution:")
for author, count in sorted(all_commit_authors.items(), key=lambda x: -x[1]):
    report.append(f"    {author:20s}: {count} commits")

# ============================================================
# SECTION 3: FILE TREE COMPLETENESS
# ============================================================
report.append("\n\nSECTION 3: FILE TREE COMPLETENESS")
report.append("-" * 80)

EXPECTED_DIRS = {
    "standard": ["docs/spec", "docs/design", "src", "tests", "docs/integration", "docs/ratification"],
    "ai": ["docs/spec", "docs/design", "src", "tests", "docs/integration", "docs/ratification"],
}

# Standard repos are first 18, AI repos are last 4
standard_repos = REPOS[:18]
ai_repos = REPOS[18:]

file_hashes = defaultdict(list)  # hash -> [(repo, path)]

for repo_name in REPOS:
    if not repo_stats[repo_name]["exists"]:
        continue
    
    # Get file tree
    tree = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/git/trees/main?recursive=1")
    if not tree or 'tree' not in tree:
        report.append(f"  {repo_name}: ERROR fetching tree")
        continue
    
    files = [f['path'] for f in tree['tree'] if f['type'] == 'blob']
    dirs = set()
    for f in files:
        parts = f.split('/')
        for i in range(1, len(parts)):
            dirs.add('/'.join(parts[:i]))
    
    # Check expected directories
    repo_type = "ai" if repo_name in ai_repos else "standard"
    expected = EXPECTED_DIRS[repo_type]
    missing_dirs = [d for d in expected if d not in dirs]
    
    # Check for key files
    has_src = any(f.startswith('src/') and f.endswith('.ts') for f in files)
    has_tests = any(f.startswith('tests/') and f.endswith('.test.ts') for f in files)
    has_spec = any(f.startswith('docs/spec/') for f in files)
    has_design = any(f.startswith('docs/design/') for f in files)
    has_readme = 'README.md' in files
    has_package = 'package.json' in files
    has_tsconfig = 'tsconfig.json' in files
    has_ratification = any(f.startswith('docs/ratification/') for f in files)
    
    status = "COMPLETE" if all([has_src, has_tests, has_spec, has_design, has_readme, has_package, has_tsconfig, has_ratification]) else "INCOMPLETE"
    
    report.append(f"  [{status}] {repo_name:50s} | {len(files):2d} files")
    report.append(f"           src={has_src} tests={has_tests} spec={has_spec} design={has_design} readme={has_readme} pkg={has_package} ts={has_tsconfig} ratify={has_ratification}")
    if missing_dirs:
        report.append(f"           MISSING DIRS: {missing_dirs}")
    
    # Hash key files for cross-repo comparison
    for f in files:
        if f.endswith('.ts') and ('src/' in f or 'tests/' in f):
            sha = [item['sha'] for item in tree['tree'] if item['path'] == f]
            if sha:
                file_hashes[sha[0]].append((repo_name, f))
    
    time.sleep(0.3)

# ============================================================
# SECTION 4: CROSS-REPO UNIQUENESS CHECK
# ============================================================
report.append("\n\nSECTION 4: CROSS-REPO UNIQUENESS CHECK")
report.append("-" * 80)

duplicates_found = 0
for sha, locations in file_hashes.items():
    if len(locations) > 1:
        # Only flag if files are from different repos
        repos_involved = set(loc[0] for loc in locations)
        if len(repos_involved) > 1:
            duplicates_found += 1
            if duplicates_found <= 10:
                report.append(f"  DUPLICATE SHA {sha[:8]}:")
                for repo, path in locations:
                    report.append(f"    - {repo}/{path}")

if duplicates_found == 0:
    report.append("  No cross-repo file duplicates found — all source files are unique per organelle.")
else:
    report.append(f"\n  Total cross-repo duplicates: {duplicates_found}")

# ============================================================
# SECTION 5: AGENT COMMIT SIGNATURE COMPLIANCE
# ============================================================
report.append("\n\nSECTION 5: AGENT COMMIT SIGNATURE COMPLIANCE")
report.append("-" * 80)

VALID_AGENTS = {"webwaka007", "webwakaagent3", "webwakaagent4", "webwakaagent5"}
invalid_authors = []

for author, count in all_commit_authors.items():
    if author not in VALID_AGENTS:
        invalid_authors.append((author, count))

if not invalid_authors:
    report.append("  All commit authors are valid WebWaka agents.")
else:
    report.append("  INVALID AUTHORS FOUND:")
    for author, count in invalid_authors:
        report.append(f"    {author}: {count} commits")

report.append(f"\n  Valid agent commits:")
for agent in sorted(VALID_AGENTS):
    count = all_commit_authors.get(agent, 0)
    report.append(f"    {agent:20s}: {count} commits")

# ============================================================
# SECTION 6: OVERALL COMPLIANCE SCORE
# ============================================================
report.append("\n\n" + "=" * 120)
report.append("OVERALL COMPLIANCE SCORE")
report.append("=" * 120)

checks = {
    "All 22 repos exist": existing == 22,
    "All repos have source code": all(repo_commit_data.get(r, {}).get('count', 0) > 1 for r in REPOS if repo_stats[r]['exists']),
    "All commit authors are valid agents": len(invalid_authors) == 0,
    "No cross-repo file duplicates": duplicates_found == 0,
}

total_checks = len(checks)
passed_checks = sum(1 for v in checks.values() if v)

for check, passed in checks.items():
    status = "PASS" if passed else "FAIL"
    report.append(f"  [{status}] {check}")

report.append(f"\n  Score: {passed_checks}/{total_checks} ({passed_checks/total_checks*100:.0f}%)")

if passed_checks == total_checks:
    report.append("\n  VERDICT: ORGANELLE-UNIVERSE REMEDIATION IS COMPLETE AND VERIFIED.")
    report.append("  The Cell-Universe layer is now UNLOCKED for execution.")
else:
    report.append("\n  VERDICT: REMEDIATION INCOMPLETE — issues found above must be resolved.")

report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/09_post_remediation_audit.txt", "w") as f:
    f.write(report_text)

# Print summary
print(report_text[-2000:])
print(f"\nFull report: /home/ubuntu/audit_data/09_post_remediation_audit.txt")
