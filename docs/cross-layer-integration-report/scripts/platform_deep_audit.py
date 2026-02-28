#!/usr/bin/env python3
"""
WebWaka Platform Deep Audit
============================
Examines representative repos from every layer to understand:
- Tech stack & dependencies
- Architecture patterns
- Deployment artifacts
- Configuration patterns
- Test infrastructure
- Build system
"""

import subprocess, json, base64, time, sys

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
    try:
        r = subprocess.run(
            ["curl", "-s", "-H", f"Authorization: token {pat}", url],
            capture_output=True, text=True, timeout=30
        )
        return json.loads(r.stdout)
    except:
        return None

def get_file(repo, path):
    data = api(f"https://api.github.com/repos/{ORG}/{repo}/contents/{path}")
    if data and isinstance(data, dict) and "content" in data:
        try:
            return base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        except:
            return None
    return None

def log(msg):
    print(msg, flush=True)

# Representative repos: 2 per layer (diverse selection)
SAMPLES = {
    "organelle": [
        "webwaka-organelle-audit-emitter",
        "webwaka-organelle-workflow-orchestrator",
        "webwaka-organelle-record-store",
    ],
    "cell": [
        "webwaka-cell-access-ctrl",
        "webwaka-cell-ai-cognitive-cell",
        "webwaka-cell-event-dispatch",
    ],
    "tissue": [
        "webwaka-tissue-ai-cognitive",
        "webwaka-tissue-workflow",
    ],
    "organ": [
        "webwaka-organ-ai-model-serving",
        "webwaka-organ-fin-payment-processing",
        "webwaka-organ-com-order-management",
    ],
    "system": [
        "webwaka-system-ai-cognitive-fabric",
        "webwaka-system-fin-banking",
        "webwaka-system-com-ecommerce",
    ],
    "organism": [
        "webwaka-organism-platform",
    ],
}

findings = {}

log("=" * 70)
log("WEBWAKA PLATFORM DEEP AUDIT")
log("=" * 70)

for layer, repos in SAMPLES.items():
    log(f"\n{'='*60}")
    log(f"LAYER: {layer.upper()}")
    log(f"{'='*60}")
    
    for repo in repos:
        log(f"\n--- {repo} ---")
        repo_findings = {
            "layer": layer,
            "repo": repo,
            "package_json": None,
            "tsconfig": None,
            "file_tree": [],
            "readme_excerpt": "",
            "entity_excerpt": "",
            "types_excerpt": "",
            "test_files": [],
            "doc_files": [],
            "config_files": [],
        }
        
        # 1. File tree
        tree = api(f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1")
        if tree and "tree" in tree:
            files = [f["path"] for f in tree["tree"] if f["type"] == "blob"]
            repo_findings["file_tree"] = files
            repo_findings["test_files"] = [f for f in files if f.startswith("tests/")]
            repo_findings["doc_files"] = [f for f in files if f.startswith("docs/")]
            repo_findings["config_files"] = [f for f in files if any(f.endswith(ext) for ext in ['.json', '.yaml', '.yml', '.toml', '.config.ts', '.config.js'])]
            log(f"  Files: {len(files)} total, {len(repo_findings['test_files'])} tests, {len(repo_findings['doc_files'])} docs")
        
        # 2. package.json
        pkg = get_file(repo, "package.json")
        if pkg:
            try:
                pkg_data = json.loads(pkg)
                repo_findings["package_json"] = {
                    "name": pkg_data.get("name"),
                    "version": pkg_data.get("version"),
                    "private": pkg_data.get("private"),
                    "scripts": pkg_data.get("scripts", {}),
                    "dependencies": pkg_data.get("dependencies", {}),
                    "devDependencies": pkg_data.get("devDependencies", {}),
                    "engines": pkg_data.get("engines", {}),
                    "main": pkg_data.get("main"),
                    "types": pkg_data.get("types"),
                    "type": pkg_data.get("type"),
                }
                log(f"  Package: {pkg_data.get('name')} v{pkg_data.get('version')}")
                log(f"  Scripts: {list(pkg_data.get('scripts', {}).keys())}")
                log(f"  Dependencies: {list(pkg_data.get('dependencies', {}).keys())[:10]}")
                log(f"  DevDependencies: {list(pkg_data.get('devDependencies', {}).keys())[:10]}")
            except:
                log(f"  ⚠ Invalid package.json")
        
        # 3. tsconfig.json
        tsconfig = get_file(repo, "tsconfig.json")
        if tsconfig:
            try:
                ts_data = json.loads(tsconfig)
                repo_findings["tsconfig"] = ts_data
                log(f"  TSConfig target: {ts_data.get('compilerOptions', {}).get('target', 'N/A')}")
                log(f"  TSConfig module: {ts_data.get('compilerOptions', {}).get('module', 'N/A')}")
            except:
                log(f"  ⚠ Invalid tsconfig.json")
        
        # 4. README excerpt
        readme = get_file(repo, "README.md")
        if readme:
            repo_findings["readme_excerpt"] = readme[:800]
            log(f"  README: {len(readme)} chars")
        
        # 5. Entity file excerpt
        src_files = [f for f in repo_findings["file_tree"] if f.startswith("src/") and f.endswith(".ts")]
        entity_file = next((f for f in src_files if "entity" in f.lower()), None)
        if entity_file:
            entity = get_file(repo, entity_file)
            if entity:
                repo_findings["entity_excerpt"] = entity[:1000]
                log(f"  Entity: {entity_file} ({len(entity)} chars)")
        
        # 6. Types file excerpt
        types_file = next((f for f in src_files if "types.ts" in f), None)
        if types_file:
            types = get_file(repo, types_file)
            if types:
                repo_findings["types_excerpt"] = types[:800]
                log(f"  Types: {types_file} ({len(types)} chars)")
        
        # 7. Check for deployment/CI files
        deploy_files = [f for f in repo_findings["file_tree"] if any(
            kw in f.lower() for kw in ["docker", "ci", "deploy", "k8s", "helm", "terraform", ".github", "workflow"]
        )]
        if deploy_files:
            log(f"  Deploy files: {deploy_files}")
        else:
            log(f"  Deploy files: NONE")
        
        findings[repo] = repo_findings
        time.sleep(0.5)

# Save all findings
with open("/home/ubuntu/platform_audit_findings.json", "w") as f:
    json.dump(findings, f, indent=2, default=str)

log(f"\n{'='*70}")
log("AUDIT COMPLETE — findings saved to platform_audit_findings.json")
log(f"{'='*70}")
