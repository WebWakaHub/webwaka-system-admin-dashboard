#!/usr/bin/env python3
"""Create all 19 system implementation repos in WebWakaHub org."""
import json, subprocess, time

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

with open('/home/ubuntu/system_data/repo_map.json') as f:
    repo_map = json.load(f)

print(f"Creating {len(repo_map)} system repos...")

created = 0
existed = 0
failed = 0

for sys_id, repo_name in sorted(repo_map.items()):
    # Check if repo exists
    result = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
         "-H", f"Authorization: token {PAT}",
         f"https://api.github.com/repos/{ORG}/{repo_name}"],
        capture_output=True, text=True, timeout=15
    )
    
    if result.stdout.strip() == "200":
        print(f"  EXISTS: {repo_name}")
        existed += 1
        continue
    
    # Create repo
    payload = json.dumps({
        "name": repo_name,
        "description": f"Implementation repo for {sys_id} — System-Universe layer",
        "private": True,
        "auto_init": True
    })
    
    result = subprocess.run(
        ["curl", "-s", "-X", "POST",
         "-H", f"Authorization: token {PAT}",
         "-H", "Content-Type: application/json",
         f"https://api.github.com/orgs/{ORG}/repos",
         "-d", payload],
        capture_output=True, text=True, timeout=15
    )
    
    resp = json.loads(result.stdout)
    if 'id' in resp:
        print(f"  CREATED: {repo_name}")
        created += 1
    else:
        print(f"  FAILED: {repo_name} - {resp.get('message', 'unknown')}")
        failed += 1
    
    time.sleep(0.5)

print(f"\nDone: {created} created, {existed} existed, {failed} failed")
