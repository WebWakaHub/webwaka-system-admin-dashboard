#!/usr/bin/env python3
"""
Deep content inspection:
1. Compare shared files (state-machine.ts, event-interface.ts, etc.) across repos for template reuse
2. Check entity/orchestrator files for domain-specific logic
3. Verify our 4 AI organelle work actually exists somewhere
"""
import json
import subprocess
import base64
import time
from collections import defaultdict
import hashlib

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

def api_get(url):
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: token {PAT}", url],
        capture_output=True, text=True, timeout=30
    )
    try:
        return json.loads(result.stdout)
    except:
        return None

def get_file_content(repo, path):
    data = api_get(f"https://api.github.com/repos/{ORG}/{repo}/contents/{path}")
    if data and 'content' in data:
        return base64.b64decode(data['content']).decode('utf-8', errors='replace')
    return None

repos = [
    "webwaka-organelle-subject-registry",
    "webwaka-organelle-event-dispatcher",
    "webwaka-organelle-message-gateway",
    "webwaka-organelle-cognitive-port",
    "webwaka-organelle-prompt-assembler",
    "webwaka-organelle-audit-logger",
    "webwaka-organelle-composition-modeler",
    "webwaka-organelle-validation-engine",
    "webwaka-organelle-workflow-orchestrator",
    "webwaka-organelle-trust-assertion",
    "webwaka-organelle-resource-allocator",
    "webwaka-organelle-telemetry-collector",
    "webwaka-organelle-policy-definition",
    "webwaka-organelle-record-store",
    "webwaka-organelle-discovery-registry",
    "webwaka-organelle-governance-registry",
    "webwaka-organelle-scheduler-executor",
]

report = []
report.append("=" * 120)
report.append("DEEP CONTENT INSPECTION - TEMPLATE vs REAL CONTENT ANALYSIS")
report.append("=" * 120)

# ============================================================
# SECTION 1: Compare common files across repos
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 1: CROSS-REPO FILE COMPARISON (Template Detection)")
report.append("=" * 80)

common_files = ["src/state-machine.ts", "src/event-interface.ts", "src/observability-interface.ts", "src/storage-interface.ts"]

for common_file in common_files:
    report.append(f"\n  --- {common_file} ---")
    hashes = {}
    sizes = {}
    
    for repo in repos:
        content = get_file_content(repo, common_file)
        if content:
            h = hashlib.md5(content.encode()).hexdigest()
            hashes[repo] = h
            sizes[repo] = len(content)
        time.sleep(0.15)
    
    # Group by hash
    hash_groups = defaultdict(list)
    for repo, h in hashes.items():
        hash_groups[h].append(repo)
    
    unique_count = len(hash_groups)
    total_count = len(hashes)
    
    report.append(f"    Found in {total_count} repos, {unique_count} unique versions")
    
    if unique_count == 1 and total_count > 1:
        report.append(f"    *** ALL IDENTICAL - LIKELY TEMPLATE ***")
    elif unique_count < total_count:
        report.append(f"    Some repos share identical files:")
        for h, repos_with_hash in hash_groups.items():
            if len(repos_with_hash) > 1:
                report.append(f"      Same content ({h[:8]}): {', '.join([r.replace('webwaka-organelle-','') for r in repos_with_hash])}")
    else:
        report.append(f"    All unique - GOOD (domain-specific content)")

# ============================================================
# SECTION 2: Check entity files for domain-specific logic
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 2: ENTITY FILE DOMAIN-SPECIFICITY CHECK")
report.append("=" * 80)

entity_hashes = {}
entity_sizes = {}

for repo in repos:
    # Find the entity file
    tree = api_get(f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1")
    if not tree or 'tree' not in tree:
        continue
    
    entity_files = [t['path'] for t in tree['tree'] if t['type'] == 'blob' and 'entity' in t['path'].lower() and t['path'].endswith('.ts')]
    
    for ef in entity_files:
        content = get_file_content(repo, ef)
        if content:
            h = hashlib.md5(content.encode()).hexdigest()
            entity_hashes[f"{repo}:{ef}"] = h
            entity_sizes[f"{repo}:{ef}"] = len(content)
            
            # Check for domain-specific keywords
            short_name = repo.replace('webwaka-organelle-', '')
            domain_keywords = short_name.replace('-', ' ').split()
            
            keyword_found = sum(1 for kw in domain_keywords if kw.lower() in content.lower())
            
            report.append(f"\n  {repo} -> {ef}")
            report.append(f"    Size: {len(content)} chars, {len(content.splitlines())} lines")
            report.append(f"    Domain keywords found: {keyword_found}/{len(domain_keywords)} ({domain_keywords})")
            
            # Check for real logic patterns
            logic_patterns = {
                'conditionals': content.count('if (') + content.count('if('),
                'loops': content.count('for (') + content.count('for(') + content.count('while ('),
                'error_handling': content.count('try {') + content.count('catch ('),
                'method_defs': content.count('public ') + content.count('private ') + content.count('protected '),
                'async_ops': content.count('async ') + content.count('await '),
            }
            report.append(f"    Logic patterns: {json.dumps(logic_patterns)}")
    
    time.sleep(0.2)

# Check for identical entity files
entity_hash_groups = defaultdict(list)
for key, h in entity_hashes.items():
    entity_hash_groups[h].append(key)

identical_entities = {h: repos for h, repos in entity_hash_groups.items() if len(repos) > 1}
if identical_entities:
    report.append(f"\n  *** IDENTICAL ENTITY FILES FOUND: ***")
    for h, repos in identical_entities.items():
        report.append(f"    Hash {h[:8]}: {repos}")
else:
    report.append(f"\n  All entity files are unique - GOOD")

# ============================================================
# SECTION 3: Check for test files anywhere
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 3: TEST FILE EXISTENCE CHECK")
report.append("=" * 80)

for repo in repos:
    tree = api_get(f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1")
    if not tree or 'tree' not in tree:
        continue
    
    test_files = [t['path'] for t in tree['tree'] if t['type'] == 'blob' and ('test' in t['path'].lower() or 'spec' in t['path'].lower())]
    
    short_name = repo.replace('webwaka-organelle-', '')
    if test_files:
        report.append(f"  {short_name}: {len(test_files)} test files - {test_files}")
    else:
        report.append(f"  {short_name}: *** NO TEST FILES ***")
    
    time.sleep(0.15)

# ============================================================
# SECTION 4: Check for documentation beyond README
# ============================================================
report.append("\n" + "=" * 80)
report.append("SECTION 4: DOCUMENTATION CHECK")
report.append("=" * 80)

for repo in repos:
    tree = api_get(f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1")
    if not tree or 'tree' not in tree:
        continue
    
    doc_files = [t['path'] for t in tree['tree'] if t['type'] == 'blob' and t['path'].endswith('.md')]
    
    short_name = repo.replace('webwaka-organelle-', '')
    report.append(f"  {short_name}: {len(doc_files)} .md files - {doc_files}")
    
    # Check README content quality
    readme = get_file_content(repo, "README.md")
    if readme:
        readme_lines = len(readme.splitlines())
        readme_chars = len(readme)
        has_api_docs = 'api' in readme.lower() or 'interface' in readme.lower()
        has_usage = 'usage' in readme.lower() or 'example' in readme.lower()
        has_arch = 'architecture' in readme.lower() or 'design' in readme.lower()
        report.append(f"    README: {readme_lines} lines, {readme_chars} chars")
        report.append(f"    Has API docs: {has_api_docs} | Usage: {has_usage} | Architecture: {has_arch}")
    
    time.sleep(0.15)

report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/07_deep_content_audit.txt", "w") as f:
    f.write(report_text)

print(f"Report written: {len(report_text)} chars")
# Print summary sections
for line in report:
    if 'IDENTICAL' in line or 'TEMPLATE' in line or 'NO TEST' in line or 'SECTION' in line or '===' in line:
        print(line)
