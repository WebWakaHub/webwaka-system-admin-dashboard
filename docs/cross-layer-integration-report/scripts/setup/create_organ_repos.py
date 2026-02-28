#!/usr/bin/env python3
"""Create all 56 organ implementation repos in the WebWakaHub org."""
import json
import subprocess
import time

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

with open("/home/ubuntu/organ_data/execution_map.json") as f:
    exec_map = json.load(f)

def organ_to_repo(organ_id):
    """Convert organ ID to repo name: ORGX-COM-PRODUCT_CATALOG -> webwaka-organ-product-catalog"""
    # Remove ORGX- prefix, then take the name part after the domain prefix
    parts = organ_id.replace("ORGX-", "").split("-", 1)
    domain = parts[0].lower()
    name = parts[1].lower().replace("_", "-") if len(parts) > 1 else domain
    return f"webwaka-organ-{domain}-{name}"

def create_repo(repo_name, description):
    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        "-H", f"Authorization: token {PAT}",
        "-H", "Accept: application/vnd.github.v3+json",
        f"https://api.github.com/orgs/{ORG}/repos",
        "-d", json.dumps({
            "name": repo_name,
            "description": description,
            "private": True,
            "auto_init": True,
        })
    ], capture_output=True, text=True, timeout=15)
    data = json.loads(result.stdout)
    return "id" in data or "already exists" in result.stdout.lower()

created = 0
existed = 0
failed = 0

for organ_id in sorted(exec_map.keys()):
    repo_name = organ_to_repo(organ_id)
    
    # Check if exists
    check = subprocess.run([
        "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
        "-H", f"Authorization: token {PAT}",
        f"https://api.github.com/repos/{ORG}/{repo_name}"
    ], capture_output=True, text=True, timeout=10)
    
    if check.stdout.strip() == "200":
        print(f"  EXISTS: {repo_name}")
        existed += 1
    else:
        # Create
        desc = f"Organ implementation: {organ_id} — Business Capability Domain"
        if create_repo(repo_name, desc):
            print(f"  CREATED: {repo_name}")
            created += 1
            time.sleep(0.5)
        else:
            print(f"  FAILED: {repo_name}")
            failed += 1
            time.sleep(1)

print(f"\nSummary: {created} created, {existed} existed, {failed} failed")

# Save repo mapping
repo_map = {}
for organ_id in sorted(exec_map.keys()):
    repo_map[organ_id] = organ_to_repo(organ_id)

with open("/home/ubuntu/organ_data/repo_map.json", "w") as f:
    json.dump(repo_map, f, indent=2)

print(f"Repo map saved to /home/ubuntu/organ_data/repo_map.json")
