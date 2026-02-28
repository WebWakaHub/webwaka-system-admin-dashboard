#!/usr/bin/env python3
"""
Deep file content audit: check if organelle repo files contain real, substantive content
or are just templates/stubs. Sample files from multiple repos.
"""
import json
import subprocess
import base64
import time

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
    """Get file content from GitHub API"""
    data = api_get(f"https://api.github.com/repos/{ORG}/{repo}/contents/{path}")
    if data and 'content' in data:
        content = base64.b64decode(data['content']).decode('utf-8', errors='replace')
        return content
    return None

# Repos to audit deeply
repos_to_check = [
    # Our 4 AI organelles (if repos exist - they map to standard repos)
    "webwaka-organelle-cognitive-port",
    "webwaka-organelle-prompt-assembler",
    # Standard organelles
    "webwaka-organelle-subject-registry",
    "webwaka-organelle-event-dispatcher",
    "webwaka-organelle-message-gateway",
    "webwaka-organelle-audit-logger",
    "webwaka-organelle-composition-modeler",
    "webwaka-organelle-validation-engine",
    "webwaka-organelle-workflow-orchestrator",
    "webwaka-organelle-trust-assertion",
    "webwaka-organelle-resource-allocator",
    "webwaka-organelle-telemetry-collector",
]

report = []
report.append("=" * 120)
report.append("FILE CONTENT DEPTH AUDIT - CHECKING FOR REAL vs TEMPLATE CONTENT")
report.append("=" * 120)

# Track patterns for cross-repo comparison
all_index_contents = []
all_types_contents = []
all_entity_contents = []

for repo in repos_to_check:
    report.append(f"\n{'=' * 100}")
    report.append(f"REPO: {repo}")
    report.append(f"{'=' * 100}")
    
    # Get file tree
    tree = api_get(f"https://api.github.com/repos/{ORG}/{repo}/git/trees/main?recursive=1")
    if not tree or 'tree' not in tree:
        report.append("  ERROR: Could not fetch file tree")
        continue
    
    files = [t['path'] for t in tree['tree'] if t['type'] == 'blob']
    ts_files = [f for f in files if f.endswith('.ts')]
    
    report.append(f"  Total files: {len(files)}")
    report.append(f"  TypeScript files: {len(ts_files)}")
    
    # Check key files
    files_to_inspect = []
    
    # Always check index.ts, types.ts, and the main entity file
    for f in ts_files:
        if f.endswith('index.ts') or f.endswith('types.ts'):
            files_to_inspect.append(f)
        elif 'entity' in f or 'orchestrator' in f:
            files_to_inspect.append(f)
    
    # Also check README.md
    if 'README.md' in files:
        files_to_inspect.append('README.md')
    
    # Also check package.json
    if 'package.json' in files:
        files_to_inspect.append('package.json')
    
    for fpath in files_to_inspect:
        content = get_file_content(repo, fpath)
        if content:
            lines = content.split('\n')
            line_count = len(lines)
            char_count = len(content)
            
            # Check for template indicators
            is_template = False
            template_indicators = ['TODO', 'PLACEHOLDER', 'TEMPLATE', 'STUB', 'NOT IMPLEMENTED']
            found_indicators = [ind for ind in template_indicators if ind.lower() in content.lower()]
            
            # Check for real logic (function bodies with actual code)
            has_logic = any(kw in content for kw in ['if (', 'switch (', 'for (', 'while (', 'try {', 'catch (', 'return ', 'throw ', 'await '])
            has_classes = 'class ' in content
            has_interfaces = 'interface ' in content
            has_exports = 'export ' in content
            
            report.append(f"\n  FILE: {fpath}")
            report.append(f"    Lines: {line_count} | Chars: {char_count}")
            report.append(f"    Has logic: {has_logic} | Classes: {has_classes} | Interfaces: {has_interfaces} | Exports: {has_exports}")
            if found_indicators:
                report.append(f"    *** TEMPLATE INDICATORS: {', '.join(found_indicators)} ***")
            
            # Show first 30 lines and last 10 lines
            report.append(f"    --- First 30 lines ---")
            for line in lines[:30]:
                report.append(f"    | {line[:120]}")
            if line_count > 40:
                report.append(f"    --- ... ({line_count - 40} lines omitted) ---")
                report.append(f"    --- Last 10 lines ---")
                for line in lines[-10:]:
                    report.append(f"    | {line[:120]}")
            
            # Collect for cross-repo comparison
            if fpath.endswith('index.ts'):
                all_index_contents.append((repo, content[:500]))
            elif fpath.endswith('types.ts'):
                all_types_contents.append((repo, content[:500]))
        
        time.sleep(0.2)

# Cross-repo comparison
report.append(f"\n\n{'=' * 100}")
report.append("CROSS-REPO COMPARISON: Are files identical templates?")
report.append(f"{'=' * 100}")

# Compare index.ts files
report.append(f"\n  index.ts comparison ({len(all_index_contents)} repos):")
if len(all_index_contents) > 1:
    unique_contents = set()
    for repo_name, content in all_index_contents:
        unique_contents.add(content)
    report.append(f"    Unique index.ts variants: {len(unique_contents)} out of {len(all_index_contents)}")
    if len(unique_contents) < len(all_index_contents):
        report.append(f"    *** SOME index.ts FILES ARE IDENTICAL ACROSS REPOS ***")

# Compare types.ts files
report.append(f"\n  types.ts comparison ({len(all_types_contents)} repos):")
if len(all_types_contents) > 1:
    unique_contents = set()
    for repo_name, content in all_types_contents:
        unique_contents.add(content)
    report.append(f"    Unique types.ts variants: {len(unique_contents)} out of {len(all_types_contents)}")
    if len(unique_contents) < len(all_types_contents):
        report.append(f"    *** SOME types.ts FILES ARE IDENTICAL ACROSS REPOS ***")

report_text = "\n".join(report)
with open("/home/ubuntu/audit_data/05_file_content_audit.txt", "w") as f:
    f.write(report_text)

print(f"Report written: {len(report_text)} chars")
print(report_text[:5000])
