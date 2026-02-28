#!/usr/bin/env python3
"""
Fix D1-Structure: Add entity.ts to 3 system repos that use class-named files.
Each entity.ts will re-export from the class-named file for convention compliance.
"""

import subprocess, json, base64, time

ORG = "WebWakaHub"
PAT = "REDACTED_PAT"  # System layer agent PAT

FIXES = {
    "webwaka-system-ai-cognitive-fabric": {
        "class_file": "cognitivefabricsystem",
        "class_name": "CognitiveFabricSystem",
    },
    "webwaka-system-sec-securityplatform": {
        "class_file": "securityplatformsystem",
        "class_name": "SecurityPlatformSystem",
    },
    "webwaka-system-soc-socialplatform": {
        "class_file": "socialplatformsystem",
        "class_name": "SocialPlatformSystem",
    },
}

def api_put(url, data):
    r = subprocess.run(
        ["curl", "-s", "-X", "PUT",
         "-H", f"Authorization: token {PAT}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(data),
         url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(r.stdout)
    except:
        return {"error": r.stdout[:200]}

for repo, info in FIXES.items():
    print(f"\n=== {repo} ===")
    
    entity_content = f"""/**
 * Entity re-export for convention compliance.
 * The primary system entity is defined in ./{info['class_file']}.ts
 * This file ensures the standard entity.ts interface contract is satisfied.
 */
export {{ {info['class_name']} as default }} from './{info['class_file']}';
export * from './{info['class_file']}';
"""
    
    encoded = base64.b64encode(entity_content.encode()).decode()
    
    result = api_put(
        f"https://api.github.com/repos/{ORG}/{repo}/contents/src/entity.ts",
        {
            "message": "fix: Add entity.ts re-export for cross-layer integration compliance",
            "content": encoded,
            "committer": {
                "name": "webwakaagent5",
                "email": "webwakaagent5@webwaka.com"
            }
        }
    )
    
    if "content" in result:
        print(f"  ✅ entity.ts created successfully")
    else:
        print(f"  ❌ Failed: {result.get('message', result.get('error', 'unknown'))}")
    
    time.sleep(1)

print("\nD1 remediation complete.")
