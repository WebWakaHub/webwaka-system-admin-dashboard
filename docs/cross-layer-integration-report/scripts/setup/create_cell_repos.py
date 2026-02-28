#!/usr/bin/env python3
"""
Create all 16 cell implementation repos in the WebWakaHub org.
Each repo gets initialized with a README placeholder.
"""
import json
import subprocess
import time

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

CELLS = [
    ("cmd-process", "CEL-CMDPROCESS", "Command Processing Cell"),
    ("state-store", "CEL-STATESTORE", "State Storage Cell"),
    ("event-dispatch", "CEL-EVENTDISPATCH", "Event Dispatching Cell"),
    ("policy-eval", "CEL-POLICYEVAL", "Policy Evaluation Cell"),
    ("validate-exec", "CEL-VALIDATEEXEC", "Validation Execution Cell"),
    ("resource-reg", "CEL-RESOURCEREG", "Resource Registration Cell"),
    ("aggregate", "CEL-AGGREGATE", "Aggregation Cell"),
    ("monitor", "CEL-MONITOR", "Monitoring Cell"),
    ("id-resolve", "CEL-IDRESOLVE", "Identity Resolution Cell"),
    ("ext-adapter", "CEL-EXTADAPTER", "External Adapter Cell"),
    ("telemetry", "CEL-TELEMETRY", "Telemetry Cell"),
    ("access-ctrl", "CEL-ACCESSCTRL", "Access Control Cell"),
    ("ci-gateway", "CEL-CIGATEWAY", "CI Gateway Cell"),
    ("ai-cognitive-cell", "CEL-AI-COGNITIVE_CELL", "AI Cognitive Cell"),
    ("ai-inference-cell", "CEL-AI-INFERENCE_CELL", "AI Inference Cell"),
    ("ai-streaming-cell", "CEL-AI-STREAMING_CELL", "AI Streaming Cell"),
]

for kebab, cell_id, name in CELLS:
    repo_name = f"webwaka-cell-{kebab}"
    
    # Check if repo exists
    result = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
         "-H", f"Authorization: token {PAT}",
         f"https://api.github.com/repos/{ORG}/{repo_name}"],
        capture_output=True, text=True, timeout=10
    )
    status = result.stdout.strip()
    
    if status == "200":
        print(f"  EXISTS: {repo_name}")
        continue
    
    # Create repo
    payload = json.dumps({
        "name": repo_name,
        "description": f"{name} — {cell_id}-v0.1.0 | WebWaka Biological Architecture | Cell Layer",
        "private": False,
        "auto_init": True,
    })
    
    result = subprocess.run(
        ["curl", "-s", "-X", "POST",
         "-H", f"Authorization: token {PAT}",
         "-H", "Content-Type: application/json",
         "-d", payload,
         f"https://api.github.com/orgs/{ORG}/repos"],
        capture_output=True, text=True, timeout=15
    )
    
    try:
        resp = json.loads(result.stdout)
        if 'full_name' in resp:
            print(f"  CREATED: {resp['full_name']}")
        else:
            print(f"  ERROR: {repo_name}: {resp.get('message', 'unknown')}")
    except:
        print(f"  ERROR: {repo_name}: could not parse response")
    
    time.sleep(1)

print("\nAll repos created.")
