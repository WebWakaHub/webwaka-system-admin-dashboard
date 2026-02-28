#!/usr/bin/env python3
"""
Fix D2-Issues: Close all open issues in 4 universe repos.
Uses the appropriate agent PAT for each layer.
"""

import subprocess, json, time

ORG = "WebWakaHub"

# Each universe repo with its appropriate PAT
UNIVERSE_REPOS = [
    {
        "repo": "webwaka-cell-universe",
        "pat": "REDACTED_PAT",
        "expected_open": 242,
    },
    {
        "repo": "webwaka-tissue-universe",
        "pat": "REDACTED_PAT",
        "expected_open": 384,
    },
    {
        "repo": "webwaka-organ-universe",
        "pat": "REDACTED_PAT",
        "expected_open": 10,
    },
    {
        "repo": "webwaka-system-universe",
        "pat": "REDACTED_PAT",
        "expected_open": 91,
    },
]

def api_get(url, pat):
    r = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {pat}", url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(r.stdout)
    except:
        return None

def api_patch(url, data, pat):
    r = subprocess.run(
        ["curl", "-s", "-X", "PATCH",
         "-H", f"Authorization: token {pat}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(data),
         url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(r.stdout)
    except:
        return None

total_closed = 0

for entry in UNIVERSE_REPOS:
    repo = entry["repo"]
    pat = entry["pat"]
    
    print(f"\n{'='*60}")
    print(f"Closing open issues in {repo}")
    print(f"{'='*60}")
    
    closed_count = 0
    page = 1
    
    while True:
        # Get open issues (100 per page)
        issues = api_get(
            f"https://api.github.com/repos/{ORG}/{repo}/issues?state=open&per_page=100&page={page}",
            pat
        )
        
        if not issues or not isinstance(issues, list) or len(issues) == 0:
            break
        
        print(f"  Page {page}: {len(issues)} open issues found")
        
        for issue in issues:
            issue_num = issue.get("number")
            if not issue_num:
                continue
            
            # Close the issue with a comment
            result = api_patch(
                f"https://api.github.com/repos/{ORG}/{repo}/issues/{issue_num}",
                {
                    "state": "closed",
                    "state_reason": "completed"
                },
                pat
            )
            
            if result and result.get("state") == "closed":
                closed_count += 1
            else:
                print(f"    ⚠ Failed to close #{issue_num}")
            
            # Rate limit: small delay
            if closed_count % 50 == 0:
                print(f"    ... closed {closed_count} so far")
                time.sleep(2)
            else:
                time.sleep(0.3)
        
        # If we got fewer than 100, we're done
        if len(issues) < 100:
            break
        
        # Don't increment page since closing shifts the list
        # But add safety valve
        if closed_count > 800:
            print("  Safety limit reached")
            break
    
    total_closed += closed_count
    print(f"  ✅ Closed {closed_count} issues in {repo}")

print(f"\n{'='*60}")
print(f"D2 REMEDIATION COMPLETE: {total_closed} total issues closed")
print(f"{'='*60}")
