#!/usr/bin/env python3
import json
import subprocess

PAT = "REDACTED_PAT"

all_repos = []
for page in range(1, 10):
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {PAT}",
         f"https://api.github.com/orgs/WebWakaHub/repos?per_page=100&page={page}"],
        capture_output=True, text=True, timeout=30
    )
    data = json.loads(result.stdout)
    if not isinstance(data, list) or len(data) == 0:
        break
    all_repos.extend(data)

print(f"Total repos in WebWakaHub: {len(all_repos)}\n")

for r in sorted(all_repos, key=lambda x: x['name']):
    print(f"  {r['name']} | size:{r['size']}KB | pushed:{(r.get('pushed_at') or 'never')[:10]}")

# Check for AI organelle repos specifically
print("\n--- Searching for AI/Instrumentation/External repos ---")
for r in all_repos:
    name_lower = r['name'].lower()
    if any(k in name_lower for k in ['audit-emitter', 'result-validator', 'instrumentation', 'external-adapter', 'cognitive', 'prompt-assembler', 'ai-']):
        print(f"  MATCH: {r['name']} | size:{r['size']}KB")

# Also check user repos (not org)
print("\n--- Checking user repos for webwaka007 ---")
result = subprocess.run(
    ["curl", "-s", "-H", f"Authorization: token {PAT}",
     "https://api.github.com/user/repos?per_page=100&affiliation=owner"],
    capture_output=True, text=True, timeout=30
)
user_repos = json.loads(result.stdout)
if isinstance(user_repos, list):
    for r in user_repos:
        if 'organelle' in r['name'].lower():
            print(f"  {r['full_name']} | size:{r['size']}KB | pushed:{(r.get('pushed_at') or 'never')[:10]}")
