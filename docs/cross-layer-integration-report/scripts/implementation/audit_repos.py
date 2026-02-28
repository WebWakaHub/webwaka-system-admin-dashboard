#!/usr/bin/env python3
"""
Audit all organelle implementation repos:
- Check if they have actual commits beyond initial
- Count files (especially .ts files)
- Check commit authors
- Verify real content vs empty/template
"""
import json
import subprocess
import sys

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

REPOS = [
    "webwaka-organelle-audit-logger",
    "webwaka-organelle-cognitive-port",
    "webwaka-organelle-composition-modeler",
    "webwaka-organelle-discovery-registry",
    "webwaka-organelle-event-dispatcher",
    "webwaka-organelle-governance-registry",
    "webwaka-organelle-message-gateway",
    "webwaka-organelle-policy-definition",
    "webwaka-organelle-prompt-assembler",
    "webwaka-organelle-record-store",
    "webwaka-organelle-resource-allocator",
    "webwaka-organelle-scheduler-executor",
    "webwaka-organelle-subject-registry",
    "webwaka-organelle-telemetry-collector",
    "webwaka-organelle-trust-assertion",
    "webwaka-organelle-validation-engine",
    "webwaka-organelle-workflow-orchestrator",
]

# Also check for AI-specific repos that might exist
AI_REPOS_CHECK = [
    "webwaka-organelle-ORG-AI-AUDIT_EMITTER",
    "webwaka-organelle-ORG-AI-RESULT_VALIDATOR",
    "webwaka-organelle-ORG-IN-INSTRUMENTATION_PROBE",
    "webwaka-organelle-ORG-EI-EXTERNAL_ADAPTER",
    "webwaka-organelle-ORGN-AI-AUDIT_EMITTER",
    "webwaka-organelle-ORGN-AI-RESULT_VALIDATOR",
    "webwaka-organelle-instrumentation-probe",
    "webwaka-organelle-external-adapter",
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

def check_repo(repo_name):
    """Check a single repo for content"""
    info = {}
    
    # Check if repo exists
    data = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}")
    if not data or data.get('message') == 'Not Found':
        return None
    
    info['name'] = repo_name
    info['default_branch'] = data.get('default_branch', 'main')
    info['size'] = data.get('size', 0)
    info['created'] = data.get('created_at', '')[:10]
    info['updated'] = data.get('updated_at', '')[:10]
    info['pushed'] = data.get('pushed_at', '')[:10] if data.get('pushed_at') else 'never'
    
    # Get commit count and recent commits
    commits = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/commits?per_page=100")
    if isinstance(commits, list):
        info['commit_count'] = len(commits)
        info['commits'] = []
        for c in commits[:20]:
            author = c.get('commit', {}).get('author', {}).get('name', 'unknown')
            msg = c.get('commit', {}).get('message', '')[:80]
            sha = c.get('sha', '')[:7]
            info['commits'].append({'sha': sha, 'author': author, 'msg': msg})
    else:
        info['commit_count'] = 0
        info['commits'] = []
    
    # Get file tree
    tree = api_get(f"https://api.github.com/repos/{ORG}/{repo_name}/git/trees/{info['default_branch']}?recursive=1")
    if isinstance(tree, dict) and 'tree' in tree:
        all_files = [t['path'] for t in tree['tree'] if t['type'] == 'blob']
        info['total_files'] = len(all_files)
        info['ts_files'] = [f for f in all_files if f.endswith('.ts')]
        info['test_files'] = [f for f in all_files if 'test' in f.lower() or 'spec' in f.lower()]
        info['md_files'] = [f for f in all_files if f.endswith('.md')]
        info['json_files'] = [f for f in all_files if f.endswith('.json')]
        info['all_files'] = all_files
    else:
        info['total_files'] = 0
        info['ts_files'] = []
        info['test_files'] = []
        info['md_files'] = []
        info['json_files'] = []
        info['all_files'] = []
    
    return info

# Run audit
report = []
report.append("=" * 120)
report.append("ORGANELLE IMPLEMENTATION REPOS - DEEP CONTENT AUDIT")
report.append("=" * 120)

# Check standard repos
report.append("\n=== STANDARD ORGANELLE REPOS (17 repos) ===\n")

all_repo_data = {}
for repo in REPOS:
    print(f"Checking {repo}...")
    info = check_repo(repo)
    if info:
        all_repo_data[repo] = info
        report.append(f"\n{'─' * 100}")
        report.append(f"REPO: {repo}")
        report.append(f"  Size: {info['size']} KB | Branch: {info['default_branch']}")
        report.append(f"  Created: {info['created']} | Updated: {info['updated']} | Last Push: {info['pushed']}")
        report.append(f"  Commits: {info['commit_count']}")
        report.append(f"  Files: {info['total_files']} total | {len(info['ts_files'])} .ts | {len(info['test_files'])} test | {len(info['md_files'])} .md | {len(info['json_files'])} .json")
        
        if info['ts_files']:
            report.append(f"  TypeScript files:")
            for f in info['ts_files']:
                report.append(f"    - {f}")
        
        if info['test_files']:
            report.append(f"  Test files:")
            for f in info['test_files']:
                report.append(f"    - {f}")
        
        if info['md_files']:
            report.append(f"  Documentation files:")
            for f in info['md_files']:
                report.append(f"    - {f}")
        
        if info['all_files']:
            report.append(f"  All files:")
            for f in sorted(info['all_files']):
                report.append(f"    - {f}")
        
        if info['commits']:
            report.append(f"  Recent commits:")
            for c in info['commits'][:10]:
                report.append(f"    {c['sha']} [{c['author']}] {c['msg']}")
        
        # WARNINGS
        warnings = []
        if info['total_files'] == 0:
            warnings.append("*** EMPTY REPO - NO FILES ***")
        if info['total_files'] > 0 and len(info['ts_files']) == 0:
            warnings.append("*** NO TYPESCRIPT FILES ***")
        if info['commit_count'] <= 1:
            warnings.append("*** ONLY INITIAL COMMIT - NO REAL WORK ***")
        if info['total_files'] > 0 and len(info['test_files']) == 0:
            warnings.append("*** NO TEST FILES ***")
        
        if warnings:
            report.append(f"  WARNINGS:")
            for w in warnings:
                report.append(f"    {w}")
    else:
        report.append(f"\n  {repo}: NOT FOUND")

# Check AI-specific repos
report.append(f"\n\n=== AI COGNITIVE FABRIC REPOS (checking existence) ===\n")
for repo in AI_REPOS_CHECK:
    print(f"Checking AI repo {repo}...")
    info = check_repo(repo)
    if info:
        all_repo_data[repo] = info
        report.append(f"\n{'─' * 100}")
        report.append(f"REPO: {repo}")
        report.append(f"  Size: {info['size']} KB | Branch: {info['default_branch']}")
        report.append(f"  Created: {info['created']} | Updated: {info['updated']} | Last Push: {info['pushed']}")
        report.append(f"  Commits: {info['commit_count']}")
        report.append(f"  Files: {info['total_files']} total | {len(info['ts_files'])} .ts | {len(info['test_files'])} test | {len(info['md_files'])} .md")
        
        if info['all_files']:
            report.append(f"  All files:")
            for f in sorted(info['all_files']):
                report.append(f"    - {f}")
        
        if info['commits']:
            report.append(f"  Recent commits:")
            for c in info['commits'][:10]:
                report.append(f"    {c['sha']} [{c['author']}] {c['msg']}")
    else:
        report.append(f"  {repo}: NOT FOUND")

# Summary
report.append(f"\n\n{'=' * 120}")
report.append("SUMMARY")
report.append(f"{'=' * 120}")

repos_with_ts = [r for r, d in all_repo_data.items() if len(d['ts_files']) > 0]
repos_without_ts = [r for r, d in all_repo_data.items() if len(d['ts_files']) == 0 and d['total_files'] > 0]
empty_repos = [r for r, d in all_repo_data.items() if d['total_files'] == 0]
repos_no_tests = [r for r, d in all_repo_data.items() if len(d['test_files']) == 0 and d['total_files'] > 0]

report.append(f"\nTotal repos found: {len(all_repo_data)}")
report.append(f"Repos with TypeScript files: {len(repos_with_ts)}")
report.append(f"Repos without TypeScript (but have files): {len(repos_without_ts)}")
report.append(f"Empty repos: {len(empty_repos)}")
report.append(f"Repos without tests: {len(repos_no_tests)}")

if repos_with_ts:
    report.append(f"\nRepos WITH TypeScript:")
    for r in repos_with_ts:
        d = all_repo_data[r]
        report.append(f"  {r}: {len(d['ts_files'])} .ts files, {len(d['test_files'])} tests, {d['commit_count']} commits")

if repos_without_ts:
    report.append(f"\nRepos WITHOUT TypeScript (have other files):")
    for r in repos_without_ts:
        d = all_repo_data[r]
        report.append(f"  {r}: {d['total_files']} files, {d['commit_count']} commits")

if empty_repos:
    report.append(f"\nEMPTY repos:")
    for r in empty_repos:
        report.append(f"  {r}")

report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/02_repo_content_audit.txt", "w") as f:
    f.write(report_text)

print("\n" + report_text)
