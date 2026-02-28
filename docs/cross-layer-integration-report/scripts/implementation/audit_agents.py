#!/usr/bin/env python3
"""
Cross-check agent assignments against actual commit/comment authors.
Also verify our 4 AI organelle repos' existence and content.
"""
import json
import subprocess
import time
import base64

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"
UNIVERSE_REPO = "webwaka-organelle-universe"

def api_get(url):
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {PAT}", url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(result.stdout)
    except:
        return None

# Load all issues from cache
all_issues = []
for page in range(1, 12):
    fpath = f"/tmp/issues_page_{page}.json"
    try:
        with open(fpath) as f:
            data = json.load(f)
        if isinstance(data, list) and len(data) > 0:
            all_issues.extend(data)
    except:
        break

issues_only = [i for i in all_issues if 'pull_request' not in i]

report = []
report.append("=" * 120)
report.append("AGENT ASSIGNMENT vs ACTUAL AUTHOR CROSS-CHECK")
report.append("=" * 120)

# ============================================================
# SECTION 1: Agent assignment analysis across all issues
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 1: AGENT ASSIGNMENT DISTRIBUTION")
report.append("=" * 80)

from collections import defaultdict, Counter

agent_assignments = Counter()
no_assignment = []
multi_assignment = []

for i in issues_only:
    labels = [l['name'] for l in i.get('labels', [])]
    assigned = [l for l in labels if l.startswith('assigned:')]
    
    if len(assigned) == 0:
        no_assignment.append(i['number'])
    elif len(assigned) > 1:
        multi_assignment.append((i['number'], assigned))
    
    for a in assigned:
        agent_assignments[a] += 1

report.append(f"\nAgent assignment distribution:")
for agent, count in sorted(agent_assignments.items(), key=lambda x: -x[1]):
    report.append(f"  {agent}: {count} issues")

report.append(f"\nIssues with NO assignment: {len(no_assignment)}")
if no_assignment:
    report.append(f"  Issue numbers: {no_assignment[:50]}{'...' if len(no_assignment) > 50 else ''}")

report.append(f"\nIssues with MULTIPLE assignments: {len(multi_assignment)}")
if multi_assignment:
    for num, assigns in multi_assignment[:20]:
        report.append(f"  #{num}: {assigns}")

# ============================================================
# SECTION 2: Commit author analysis per repo
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 2: COMMIT AUTHORS PER REPO")
report.append("=" * 80)

repos = [
    "webwaka-organelle-subject-registry",
    "webwaka-organelle-event-dispatcher",
    "webwaka-organelle-message-gateway",
    "webwaka-organelle-cognitive-port",
    "webwaka-organelle-prompt-assembler",
    "webwaka-organelle-audit-logger",
    "webwaka-organelle-composition-modeler",
    "webwaka-organelle-validation-engine",
    "webwaka-organelle-workflow-orchestrator",
    "webwaka-organelle-trust-assertion",
    "webwaka-organelle-resource-allocator",
    "webwaka-organelle-telemetry-collector",
    "webwaka-organelle-policy-definition",
    "webwaka-organelle-record-store",
    "webwaka-organelle-discovery-registry",
    "webwaka-organelle-governance-registry",
    "webwaka-organelle-scheduler-executor",
]

for repo in repos:
    commits = api_get(f"https://api.github.com/repos/{ORG}/{repo}/commits?per_page=100")
    if isinstance(commits, list):
        authors = Counter()
        for c in commits:
            author = c.get('commit', {}).get('author', {}).get('name', 'unknown')
            committer = c.get('commit', {}).get('committer', {}).get('name', 'unknown')
            gh_author = c.get('author', {})
            gh_login = gh_author.get('login', 'unknown') if gh_author else 'unknown'
            authors[f"{author} ({gh_login})"] += 1
        
        report.append(f"\n  {repo}:")
        report.append(f"    Total commits: {len(commits)}")
        for auth, count in authors.most_common():
            report.append(f"    {auth}: {count} commits")
    else:
        report.append(f"\n  {repo}: ERROR fetching commits")
    
    time.sleep(0.3)

# ============================================================
# SECTION 3: Check who closed each issue (closed_by field)
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 3: ISSUE CLOSER ANALYSIS")
report.append("=" * 80)

closer_counts = Counter()
mismatch_count = 0
mismatches = []

for i in issues_only:
    labels = [l['name'] for l in i.get('labels', [])]
    assigned = [l.replace('assigned:', '') for l in labels if l.startswith('assigned:')]
    
    closed_by = i.get('closed_by', {})
    closer = closed_by.get('login', 'unknown') if closed_by else 'N/A'
    closer_counts[closer] += 1
    
    # Check if closer matches assigned agent
    if assigned and closer != 'N/A':
        assigned_agent = assigned[0] if assigned else None
        if assigned_agent and closer != assigned_agent:
            # Check if it's a phase issue (phase closers may differ from task agents)
            title = i.get('title', '')
            is_task = any(f'T0{t}' in title for t in range(1, 4))
            if is_task:
                mismatch_count += 1
                if len(mismatches) < 30:
                    mismatches.append((i['number'], assigned_agent, closer, title[:60]))

report.append(f"\nIssue closer distribution:")
for closer, count in sorted(closer_counts.items(), key=lambda x: -x[1]):
    report.append(f"  {closer}: {count} issues")

report.append(f"\nTask-level agent mismatches (assigned != closer): {mismatch_count}")
if mismatches:
    report.append(f"  Sample mismatches:")
    for num, assigned, closer, title in mismatches:
        report.append(f"    #{num}: assigned={assigned}, closed_by={closer} | {title}")

# ============================================================
# SECTION 4: Verify our 4 AI organelle implementation repos
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 4: AI COGNITIVE FABRIC ORGANELLE REPO MAPPING")
report.append("=" * 80)

# The 4 AI organelles we executed:
# 1. ORG-IN-INSTRUMENTATION_PROBE -> which repo?
# 2. ORG-EI-EXTERNAL_ADAPTER -> which repo?
# 3. ORGN-AI-RESULT_VALIDATOR -> which repo?
# 4. ORGN-AI-AUDIT_EMITTER -> which repo?

# Check issue bodies for repo references
ai_issues = [465, 494, 958, 987]  # Master issues
for issue_num in ai_issues:
    issue = api_get(f"https://api.github.com/repos/{ORG}/{UNIVERSE_REPO}/issues/{issue_num}")
    if issue:
        title = issue.get('title', '')
        body = issue.get('body', '') or ''
        
        report.append(f"\n  #{issue_num}: {title[:80]}")
        
        # Look for repo references in body
        repo_refs = []
        for line in body.split('\n'):
            if 'repo' in line.lower() or 'repository' in line.lower() or 'github.com' in line.lower():
                repo_refs.append(line.strip()[:120])
        
        if repo_refs:
            report.append(f"    Repo references in body:")
            for ref in repo_refs:
                report.append(f"      {ref}")
        else:
            report.append(f"    No repo references found in body")
        
        # Check comments for repo references
        comments = api_get(f"https://api.github.com/repos/{ORG}/{UNIVERSE_REPO}/issues/{issue_num}/comments?per_page=20")
        if isinstance(comments, list):
            for c in comments:
                cbody = c.get('body', '') or ''
                for line in cbody.split('\n'):
                    if 'repo' in line.lower() or 'repository' in line.lower() or 'webwaka-organelle' in line.lower():
                        report.append(f"    Comment ref: {line.strip()[:120]}")
    
    time.sleep(0.5)

# Also check: COGNITIVE_PORT and PROMPT_ASSEMBLER repos
report.append(f"\n  Cognitive Port repo (webwaka-organelle-cognitive-port):")
cp_data = api_get(f"https://api.github.com/repos/{ORG}/webwaka-organelle-cognitive-port")
if cp_data and 'name' in cp_data:
    report.append(f"    EXISTS: size={cp_data['size']}KB, pushed={cp_data.get('pushed_at','')[:10]}")
else:
    report.append(f"    NOT FOUND")

report.append(f"\n  Prompt Assembler repo (webwaka-organelle-prompt-assembler):")
pa_data = api_get(f"https://api.github.com/repos/{ORG}/webwaka-organelle-prompt-assembler")
if pa_data and 'name' in pa_data:
    report.append(f"    EXISTS: size={pa_data['size']}KB, pushed={pa_data.get('pushed_at','')[:10]}")
else:
    report.append(f"    NOT FOUND")

report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/06_agent_crosscheck.txt", "w") as f:
    f.write(report_text)

print(f"Report written: {len(report_text)} chars")
print(report_text[:6000])
