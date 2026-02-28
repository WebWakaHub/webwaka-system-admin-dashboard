#!/usr/bin/env python3
"""
Audit issue comments and events for each organelle.
Check: who closed issues, what comments exist, are there real deliverable references.
Sample a few issues from each organelle to check depth.
"""
import json
import subprocess
import time

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"
REPO = "webwaka-organelle-universe"

def api_get(url):
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {PAT}", url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(result.stdout)
    except:
        return None

# Sample issues to check deeply:
# For each of the 22 organelles, check the master issue and 2-3 task issues
# Focus on: our 4 AI organelles + a sample of the 18 "other" organelles

# Our 4 AI organelles
our_organelles = {
    "INSTRUMENTATION_PROBE": {"master": 465, "sample_tasks": [466, 470, 474, 478, 482, 486, 490]},
    "EXTERNAL_ADAPTER": {"master": 494, "sample_tasks": [495, 499, 503, 507, 511, 515, 519]},
    "RESULT_VALIDATOR": {"master": 958, "sample_tasks": [959, 963, 967, 971, 975, 979, 983]},
    "AUDIT_EMITTER": {"master": 987, "sample_tasks": [988, 992, 996, 1000, 1004, 1008, 1012]},
}

# Sample of other organelles (closed by other account)
other_organelles = {
    "SUBJECT_REGISTRY": {"master": 1, "sample_tasks": [2, 6, 10, 14, 18, 22, 26]},
    "MESSAGE_GATEWAY": {"master": 204, "sample_tasks": [205, 209, 213, 217, 221, 225, 229]},
    "COGNITIVE_PORT": {"master": 900, "sample_tasks": [901, 905, 909, 913, 917, 921, 925]},
    "PROMPT_ASSEMBLER": {"master": 929, "sample_tasks": [930, 934, 938, 942, 946, 950, 954]},
    "COMPOSITION_MODELER": {"master": 349, "sample_tasks": [350, 354, 358, 362, 366, 370, 374]},
    "EVENT_DISPATCHER": {"master": 175, "sample_tasks": [176, 180, 184, 188, 192, 196, 200]},
}

report = []
report.append("=" * 120)
report.append("ISSUE COMMENTS & EVENTS AUDIT")
report.append("=" * 120)

def audit_issue(issue_num, label=""):
    """Get comments and events for a single issue"""
    # Get issue details
    issue = api_get(f"https://api.github.com/repos/{ORG}/{REPO}/issues/{issue_num}")
    if not issue or issue.get('message') == 'Not Found':
        return f"  #{issue_num}: NOT FOUND"
    
    lines = []
    title = issue.get('title', '')[:80]
    state = issue.get('state', 'unknown')
    body = issue.get('body', '') or ''
    body_len = len(body)
    closed_by = issue.get('closed_by', {})
    closed_by_name = closed_by.get('login', 'unknown') if closed_by else 'N/A'
    
    lines.append(f"  #{issue_num} [{state}] {title}")
    lines.append(f"    Closed by: {closed_by_name}")
    lines.append(f"    Body length: {body_len} chars")
    
    # Get comments
    comments = api_get(f"https://api.github.com/repos/{ORG}/{REPO}/issues/{issue_num}/comments?per_page=100")
    if isinstance(comments, list):
        lines.append(f"    Comments: {len(comments)}")
        for c in comments:
            user = c.get('user', {}).get('login', 'unknown')
            body_preview = (c.get('body', '') or '')[:150].replace('\n', ' ')
            lines.append(f"      [{user}]: {body_preview}")
    else:
        lines.append(f"    Comments: ERROR fetching")
    
    # Get events (who closed it, label changes)
    events = api_get(f"https://api.github.com/repos/{ORG}/{REPO}/issues/{issue_num}/events?per_page=30")
    if isinstance(events, list):
        close_events = [e for e in events if e.get('event') == 'closed']
        label_events = [e for e in events if e.get('event') in ('labeled', 'unlabeled')]
        
        if close_events:
            for ce in close_events:
                actor = ce.get('actor', {}).get('login', 'unknown')
                created = ce.get('created_at', '')[:19]
                lines.append(f"    Closed event: by {actor} at {created}")
        
        if label_events:
            lines.append(f"    Label events: {len(label_events)}")
    
    time.sleep(0.3)  # Rate limit protection
    return "\n".join(lines)

# Audit our organelles
report.append("\n" + "=" * 80)
report.append("SECTION A: OUR 4 AI COGNITIVE FABRIC ORGANELLES")
report.append("=" * 80)

for name, info in our_organelles.items():
    report.append(f"\n--- {name} ---")
    report.append(audit_issue(info['master'], "MASTER"))
    for task_num in info['sample_tasks']:
        report.append(audit_issue(task_num, "PHASE"))

# Audit other organelles
report.append("\n" + "=" * 80)
report.append("SECTION B: SAMPLE OF OTHER ORGANELLES (closed by other account)")
report.append("=" * 80)

for name, info in other_organelles.items():
    report.append(f"\n--- {name} ---")
    report.append(audit_issue(info['master'], "MASTER"))
    for task_num in info['sample_tasks'][:4]:  # Sample fewer to stay within rate limits
        report.append(audit_issue(task_num, "PHASE"))

report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/04_comments_events_audit.txt", "w") as f:
    f.write(report_text)

print(report_text[:8000])
print(f"\n... Full report: {len(report_text)} chars")
