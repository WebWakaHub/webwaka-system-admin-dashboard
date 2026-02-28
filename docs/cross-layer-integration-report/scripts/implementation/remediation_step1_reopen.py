#!/usr/bin/env python3
"""
REMEDIATION STEP 1: Re-open all 522 illegitimately closed issues
for the 18 standard organelles.

The 4 AI Cognitive Fabric organelles we legitimately executed are EXCLUDED:
- ORG-IN-INSTRUMENTATION_PROBE (#465-#493)
- ORG-EI-EXTERNAL_ADAPTER (#494-#522)
- ORGN-AI-RESULT_VALIDATOR (#958-#986)
- ORGN-AI-AUDIT_EMITTER (#987-#1015)

All other closed issues in organelle-universe must be re-opened.
"""
import json
import subprocess
import time
import sys

PAT = "REDACTED_PAT"  # webwaka007 (founder authority)
ORG = "WebWakaHub"
REPO = "webwaka-organelle-universe"

# Ranges we legitimately executed (EXCLUDE from re-opening)
LEGITIMATE_RANGES = [
    (465, 493),   # INSTRUMENTATION_PROBE
    (494, 522),   # EXTERNAL_ADAPTER
    (958, 986),   # RESULT_VALIDATOR
    (987, 1015),  # AUDIT_EMITTER
]

def is_legitimate(issue_num):
    return any(lo <= issue_num <= hi for lo, hi in LEGITIMATE_RANGES)

def api_patch(url, data):
    result = subprocess.run(
        ["curl", "-s", "-X", "PATCH",
         "-H", f"Authorization: token {PAT}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(data),
         url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(result.stdout)
    except:
        return {"error": result.stdout[:200]}

def api_post(url, data):
    result = subprocess.run(
        ["curl", "-s", "-X", "POST",
         "-H", f"Authorization: token {PAT}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(data),
         url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(result.stdout)
    except:
        return {"error": result.stdout[:200]}

# Load all issues from cached data
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
print(f"Total issues loaded: {len(issues_only)}")

# Identify issues to re-open
to_reopen = []
for i in issues_only:
    if i['state'] == 'closed' and not is_legitimate(i['number']):
        to_reopen.append(i['number'])

to_reopen.sort()
print(f"Issues to re-open: {len(to_reopen)}")
print(f"Range: #{to_reopen[0]}-#{to_reopen[-1]}")

# Re-open in batches
success = 0
failed = 0
errors = []

for idx, issue_num in enumerate(to_reopen):
    url = f"https://api.github.com/repos/{ORG}/{REPO}/issues/{issue_num}"
    result = api_patch(url, {"state": "open"})
    
    if result.get('state') == 'open':
        success += 1
    else:
        failed += 1
        err_msg = result.get('message', result.get('error', 'unknown'))
        errors.append((issue_num, err_msg))
    
    # Progress report every 50
    if (idx + 1) % 50 == 0:
        print(f"  Progress: {idx+1}/{len(to_reopen)} (success: {success}, failed: {failed})")
    
    # Rate limiting: GitHub allows 5000 requests/hour = ~1.4/sec
    # Be conservative with 0.3s delay
    time.sleep(0.3)

print(f"\n=== STEP 1 COMPLETE ===")
print(f"Total re-opened: {success}")
print(f"Total failed: {failed}")
if errors:
    print(f"Errors:")
    for num, err in errors[:20]:
        print(f"  #{num}: {err}")

# Add remediation comment to each organelle master issue
# Identify master issues for the 18 standard organelles
master_issues = []
for i in issues_only:
    if not is_legitimate(i['number']):
        title = i.get('title', '')
        # Master issues don't have -P0, -P1, etc. or -T01, -T02, etc.
        if not any(f'-P{p}' in title for p in range(7)) and not any(f'-T0{t}' in title for t in range(1,4)):
            if 'Master' in title or (']' in title and '-P' not in title.split(']')[0]):
                master_issues.append(i['number'])

master_issues.sort()
print(f"\nMaster issues for standard organelles: {len(master_issues)}")
print(f"  {master_issues}")

# Post remediation comment on each master issue
comment_body = """## Remediation Protocol — Issues Re-Opened

**Authority:** webwaka007 (Founder)
**Protocol:** REMEDIATION-01
**Date:** 2026-02-27

---

This organelle's issues have been **re-opened** as part of the Organelle-Universe Remediation Plan.

**Reason:** A deep audit revealed that all 29 issues for this organelle were closed without producing the required deliverables mandated by the 7-Phase Lifecycle and 8-Step Execution Protocol. Specifically:
- **Zero test files** were found in the implementation repository.
- The repository contained only template-level code with 1-2 commits.
- Agent assignment mismatches were detected.
- The closure was deemed **illegitimate**.

**Required Action:** This organelle must be re-executed from scratch, following the full protocol without deviation. All phases (P0-P6) and all tasks (T01-T03 per phase) must produce real, verifiable deliverables.

**Status:** AWAITING RE-EXECUTION
"""

for master_num in master_issues:
    url = f"https://api.github.com/repos/{ORG}/{REPO}/issues/{master_num}/comments"
    result = api_post(url, {"body": comment_body})
    if result.get('id'):
        print(f"  Comment posted on #{master_num}")
    else:
        print(f"  Failed to comment on #{master_num}: {result.get('message', 'unknown')}")
    time.sleep(0.3)

print("\n=== STEP 1 FULLY COMPLETE ===")
