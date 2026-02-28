#!/usr/bin/env python3
"""
Cross-Layer Doctrine Compliance Audit
=======================================
Checks doctrine keyword presence across ALL files (not just types.ts)
for a representative sample from each layer.
"""

import subprocess, json, time, base64

ORG = "WebWakaHub"
PATS = [
    "REDACTED_PAT",
    "REDACTED_PAT",
    "REDACTED_PAT",
    "REDACTED_PAT",
    "REDACTED_PAT",
]
pat_idx = 0

def get_pat():
    global pat_idx
    p = PATS[pat_idx % len(PATS)]
    pat_idx += 1
    return p

def api(url):
    pat = get_pat()
    r = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {pat}", url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(r.stdout)
    except:
        return None

# Sample repos: 3 per layer (first, middle, last)
SAMPLES = {
    "organelle": [
        "webwaka-organelle-audit-emitter",
        "webwaka-organelle-message-gateway",
        "webwaka-organelle-workflow-orchestrator",
    ],
    "cell": [
        "webwaka-cell-access-ctrl",
        "webwaka-cell-event-dispatch",
        "webwaka-cell-validate-exec",
    ],
    "tissue": [
        "webwaka-tissue-ai-cognitive",
        "webwaka-tissue-event",
        "webwaka-tissue-workflow",
    ],
    "organ": [
        "webwaka-organ-ai-model-serving",
        "webwaka-organ-fin-payment-processing",
        "webwaka-organ-trn-shipment-tracking",
    ],
    "system": [
        "webwaka-system-ai-cognitive-fabric",
        "webwaka-system-fin-banking",
        "webwaka-system-soc-socialplatform",
    ],
    "organism": [
        "webwaka-organism-platform",
    ],
}

results = {"total": 0, "passed": 0, "failed": 0, "details": []}

def check(layer, repo, name, condition, detail=""):
    results["total"] += 1
    status = "PASS" if condition else "FAIL"
    if condition:
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["details"].append(f"{status}|{layer}|{repo}|{name}|{detail}")

print("=" * 70)
print("CROSS-LAYER DOCTRINE COMPLIANCE AUDIT")
print("Scanning ALL files in sample repos for doctrine keywords")
print("=" * 70)

for layer, repos in SAMPLES.items():
    print(f"\n--- Layer: {layer} ---")
    for repo in repos:
        print(f"  {repo}:")
        
        # Get file tree
        tree = api(f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1")
        if not tree or "tree" not in tree:
            check(layer, repo, "tree_accessible", False, "Cannot read tree")
            continue
        
        files = [f["path"] for f in tree["tree"] if f["type"] == "blob"]
        
        # Scan all text files for doctrine keywords
        offline_found = False
        nigeria_found = False
        timeout_found = False
        mobile_found = False
        pwa_found = False
        vendor_neutral_found = False
        
        text_files = [f for f in files if f.endswith(('.ts', '.md', '.json'))]
        
        for filepath in text_files:
            content_data = api(f"https://api.github.com/repos/{ORG}/{repo}/contents/{filepath}")
            if not content_data or not isinstance(content_data, dict) or "content" not in content_data:
                continue
            
            try:
                content = base64.b64decode(content_data["content"]).decode("utf-8", errors="replace")
            except:
                continue
            
            cl = content.lower()
            
            if not offline_found and ("offline" in cl or "queue" in cl or "sync" in cl):
                offline_found = True
            if not nigeria_found and ("en-ng" in cl or "ngn" in cl or "nigeria" in cl or "africa/lagos" in cl):
                nigeria_found = True
            if not timeout_found and ("30000" in content or "30_000" in content or "30s" in cl):
                timeout_found = True
            if not mobile_found and ("mobile" in cl or "responsive" in cl):
                mobile_found = True
            if not pwa_found and ("pwa" in cl or "service worker" in cl or "progressive" in cl):
                pwa_found = True
            if not vendor_neutral_found and ("vendor" in cl or "neutral" in cl or "pluggable" in cl):
                vendor_neutral_found = True
            
            # Early exit if all found
            if all([offline_found, nigeria_found, timeout_found, mobile_found]):
                break
            
            time.sleep(0.2)
        
        check(layer, repo, "offline_first", offline_found, "No offline/queue/sync in any file")
        check(layer, repo, "nigeria_first", nigeria_found, "No en-NG/NGN/Nigeria in any file")
        check(layer, repo, "timeout_30s", timeout_found, "No 30000/30s in any file")
        check(layer, repo, "mobile_first", mobile_found, "No mobile/responsive in any file")
        check(layer, repo, "pwa_first", pwa_found, "No pwa/service-worker in any file")
        check(layer, repo, "vendor_neutral", vendor_neutral_found, "No vendor/neutral in any file")
        
        status = "✓" if all([offline_found, nigeria_found, timeout_found]) else "△"
        print(f"    offline={offline_found} nigeria={nigeria_found} timeout={timeout_found} mobile={mobile_found} pwa={pwa_found} vendor={vendor_neutral_found} {status}")

# Summary
print("\n" + "=" * 70)
print("DOCTRINE AUDIT SUMMARY")
print("=" * 70)
rate = results["passed"] / results["total"] * 100 if results["total"] > 0 else 0
print(f"Total Checks: {results['total']}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
print(f"Pass Rate: {rate:.1f}%")

if results["failed"] > 0:
    print("\nFailures:")
    for d in results["details"]:
        if d.startswith("FAIL"):
            print(f"  ❌ {d}")

# Save
with open("/home/ubuntu/doctrine_audit_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("\nDoctrine audit complete.")
