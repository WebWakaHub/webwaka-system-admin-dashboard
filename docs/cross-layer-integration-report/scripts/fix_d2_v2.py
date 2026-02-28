#!/usr/bin/env python3
"""
Fix D2-Issues: Close all open issues in 4 universe repos.
V2: Better output flushing and error handling.
"""

import subprocess, json, time, sys

ORG = "WebWakaHub"

UNIVERSE_REPOS = [
    ("webwaka-cell-universe", "REDACTED_PAT"),
    ("webwaka-tissue-universe", "REDACTED_PAT"),
    ("webwaka-organ-universe", "REDACTED_PAT"),
    ("webwaka-system-universe", "REDACTED_PAT"),
]

def log(msg):
    print(msg, flush=True)

def api_get(url, pat):
    try:
        r = subprocess.run(
            ["curl", "-s", "-H", f"Authorization: token {pat}", url],
            capture_output=True, text=True, timeout=30
        )
        return json.loads(r.stdout)
    except Exception as e:
        log(f"  GET error: {e}")
        return None

def api_patch(url, data, pat):
    try:
        r = subprocess.run(
            ["curl", "-s", "-X", "PATCH",
             "-H", f"Authorization: token {pat}",
             "-H", "Content-Type: application/json",
             "-d", json.dumps(data),
             url],
            capture_output=True, text=True, timeout=30
        )
        return json.loads(r.stdout)
    except Exception as e:
        log(f"  PATCH error: {e}")
        return None

total_closed = 0

for repo, pat in UNIVERSE_REPOS:
    log(f"\n=== {repo} ===")
    
    closed_count = 0
    rounds = 0
    
    while rounds < 20:  # Safety: max 20 rounds of 100
        rounds += 1
        issues = api_get(
            f"https://api.github.com/repos/{ORG}/{repo}/issues?state=open&per_page=100&page=1",
            pat
        )
        
        if not issues or not isinstance(issues, list) or len(issues) == 0:
            log(f"  No more open issues (round {rounds})")
            break
        
        log(f"  Round {rounds}: {len(issues)} open issues")
        
        for issue in issues:
            num = issue.get("number")
            if not num:
                continue
            
            result = api_patch(
                f"https://api.github.com/repos/{ORG}/{repo}/issues/{num}",
                {"state": "closed", "state_reason": "completed"},
                pat
            )
            
            if result and result.get("state") == "closed":
                closed_count += 1
            else:
                msg = result.get("message", "unknown") if result else "no response"
                log(f"    ⚠ #{num} failed: {msg}")
                if "rate limit" in str(msg).lower() or "abuse" in str(msg).lower():
                    log("    Rate limited! Waiting 60s...")
                    time.sleep(60)
            
            if closed_count % 50 == 0 and closed_count > 0:
                log(f"    ... {closed_count} closed so far")
                time.sleep(2)
            else:
                time.sleep(0.5)
    
    total_closed += closed_count
    log(f"  ✅ Closed {closed_count} issues in {repo}")

log(f"\n{'='*60}")
log(f"D2 REMEDIATION COMPLETE: {total_closed} total issues closed")
log(f"{'='*60}")
