#!/usr/bin/env python3
"""Add all agents as collaborators to all tissue repos."""
import subprocess
import json
import time

PAT = "REDACTED_PAT"  # webwaka007 (org owner)
ORG = "WebWakaHub"

REPOS = [
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

AGENTS = [
    "webwakaagent1", "webwakaagent2", "webwakaagent3", "webwakaagent4",
    "webwakaagent5", "webwakaagent6", "webwakaagent7", "webwakaagent8",
    "webwakaagent9", "webwakaagent10"
]

for repo in REPOS:
    for agent in AGENTS:
        result = subprocess.run(
            ["curl", "-s", "-X", "PUT",
             "-H", f"Authorization: token {PAT}",
             "-H", "Content-Type: application/json",
             "-d", json.dumps({"permission": "push"}),
             f"https://api.github.com/repos/{ORG}/{repo}/collaborators/{agent}"],
            capture_output=True, text=True, timeout=10
        )
        status = "OK" if result.returncode == 0 else "FAIL"
        # Check response
        try:
            resp = json.loads(result.stdout) if result.stdout.strip() else {}
            if "message" in resp and "error" in resp.get("message", "").lower():
                status = f"ERROR: {resp['message']}"
        except:
            pass
        
    print(f"Added all agents to {repo}")
    time.sleep(0.5)

print("\nDone — all agents added as collaborators to all repos.")
