#!/usr/bin/env python3
"""Create all 10 tissue implementation repos in the WebWakaHub org."""
import json
import subprocess
import time

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

TISSUES = [
    "webwaka-tissue-cmd-coord",
    "webwaka-tissue-state-agg",
    "webwaka-tissue-workflow",
    "webwaka-tissue-policy",
    "webwaka-tissue-event",
    "webwaka-tissue-validate",
    "webwaka-tissue-resource",
    "webwaka-tissue-monitor",
    "webwaka-tissue-ai-cognitive",
    "webwaka-tissue-ai-entitlement",
]

for repo in TISSUES:
    # Check if exists
    result = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
         "-H", f"Authorization: token {PAT}",
         f"https://api.github.com/repos/{ORG}/{repo}"],
        capture_output=True, text=True, timeout=10
    )
    status = result.stdout.strip()
    
    if status == "200":
        print(f"EXISTS: {repo}")
        continue
    
    # Create repo
    payload = json.dumps({
        "name": repo,
        "description": f"WebWaka Tissue Layer — {repo}",
        "private": False,
        "auto_init": True
    })
    
    result = subprocess.run(
        ["curl", "-s", "-X", "POST",
         "-H", f"Authorization: token {PAT}",
         "-H", "Content-Type: application/json",
         "-d", payload,
         f"https://api.github.com/orgs/{ORG}/repos"],
        capture_output=True, text=True, timeout=15
    )
    
    resp = json.loads(result.stdout)
    if "id" in resp:
        print(f"CREATED: {repo}")
    else:
        print(f"ERROR: {repo} — {resp.get('message', 'unknown')}")
    
    time.sleep(1)

print("\nDone.")
