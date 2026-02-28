#!/usr/bin/env python3
"""
REMEDIATION STEP 2: Purge template repositories.
Delete all template content from the 17 standard organelle repos,
then push a clean initial state with only a README explaining the purge.

We cannot delete repos via API (requires admin), so we'll:
1. Clone each repo
2. Remove all template files
3. Add a PURGE_NOTICE.md explaining the remediation
4. Force push the clean state
"""
import json
import subprocess
import os
import time

PAT = "REDACTED_PAT"
ORG = "WebWakaHub"

REPOS = [
    "webwaka-organelle-audit-logger",
    "webwaka-organelle-composition-modeler",
    "webwaka-organelle-discovery-registry",
    "webwaka-organelle-event-dispatcher",
    "webwaka-organelle-governance-registry",
    "webwaka-organelle-message-gateway",
    "webwaka-organelle-policy-definition",
    "webwaka-organelle-record-store",
    "webwaka-organelle-resource-allocator",
    "webwaka-organelle-scheduler-executor",
    "webwaka-organelle-subject-registry",
    "webwaka-organelle-telemetry-collector",
    "webwaka-organelle-trust-assertion",
    "webwaka-organelle-validation-engine",
    "webwaka-organelle-workflow-orchestrator",
    "webwaka-organelle-cognitive-port",
    "webwaka-organelle-prompt-assembler",
]

PURGE_NOTICE = """# Repository Purged — Remediation Protocol

**Date:** 2026-02-27
**Authority:** webwaka007 (Founder)
**Protocol:** REMEDIATION-01

---

## Status: AWAITING LEGITIMATE RE-EXECUTION

This repository has been **purged** as part of the Organelle-Universe Remediation Plan.

### Reason for Purge

A deep audit conducted on 2026-02-27 revealed that this repository contained only **template-level code** that was generated as part of an illegitimate batch closure of organelle-universe issues. The code did not represent real, phase-by-phase work as mandated by the 7-Phase Lifecycle and 8-Step Execution Protocol.

Specific violations found:
- **Zero test files** — P3 (Testing) and P4 (Verification) phases were rubber-stamped
- **Only 1-2 commits** — Expected multi-phase commit history was absent
- **Template-identical structures** — Code was batch-generated, not individually crafted
- **Agent protocol violations** — Issues were closed by agents different from those assigned

### What Happens Next

This organelle will be re-executed from scratch following the full protocol:
- P0: Specification (3 tasks with real deliverables)
- P1: Design (3 tasks with real deliverables)
- P2: Implementation (3 tasks with real deliverables)
- P3: Testing (3 tasks with real test suites)
- P4: Integration/Verification (3 tasks with real verification)
- P5: Documentation/Deployment (3 tasks with real documentation)
- P6: Ratification (3 tasks with real ratification artifacts)

Each task will be executed by the assigned agent using the correct PAT, with real commits pushed to this repository.
"""

WORK_DIR = "/home/ubuntu/repo_purge"
os.makedirs(WORK_DIR, exist_ok=True)

success = 0
failed = 0

for repo in REPOS:
    print(f"\n=== Purging {repo} ===")
    repo_dir = os.path.join(WORK_DIR, repo)
    
    # Clone
    clone_url = f"https://x-access-token:{PAT}@github.com/{ORG}/{repo}.git"
    
    if os.path.exists(repo_dir):
        subprocess.run(["rm", "-rf", repo_dir], timeout=10)
    
    result = subprocess.run(
        ["git", "clone", clone_url, repo_dir],
        capture_output=True, text=True, timeout=30
    )
    
    if result.returncode != 0:
        print(f"  FAILED to clone: {result.stderr[:200]}")
        failed += 1
        continue
    
    os.chdir(repo_dir)
    
    # Configure git
    subprocess.run(["git", "config", "user.name", "webwaka007"], capture_output=True)
    subprocess.run(["git", "config", "user.email", "webwaka007@webwaka.com"], capture_output=True)
    
    # Remove all files except .git
    for item in os.listdir(repo_dir):
        if item == '.git':
            continue
        item_path = os.path.join(repo_dir, item)
        if os.path.isdir(item_path):
            subprocess.run(["rm", "-rf", item_path], timeout=10)
        else:
            os.remove(item_path)
    
    # Write purge notice
    with open(os.path.join(repo_dir, "README.md"), "w") as f:
        f.write(PURGE_NOTICE)
    
    # Stage, commit, force push
    subprocess.run(["git", "add", "-A"], capture_output=True, timeout=10)
    
    result = subprocess.run(
        ["git", "commit", "-m", "REMEDIATION-01: Purge template code — awaiting legitimate re-execution\n\nAll template files removed. This repository will be populated with real,\nphase-by-phase deliverables during legitimate organelle execution."],
        capture_output=True, text=True, timeout=10
    )
    
    if result.returncode != 0:
        # Maybe nothing to commit (already clean)
        print(f"  Commit result: {result.stdout[:100]} {result.stderr[:100]}")
    
    result = subprocess.run(
        ["git", "push", "--force", "origin", "main"],
        capture_output=True, text=True, timeout=30
    )
    
    if result.returncode == 0:
        print(f"  PURGED and pushed successfully")
        success += 1
    else:
        print(f"  Push failed: {result.stderr[:200]}")
        failed += 1
    
    time.sleep(0.5)

os.chdir("/home/ubuntu")

print(f"\n=== STEP 2 COMPLETE ===")
print(f"Successfully purged: {success}/{len(REPOS)}")
print(f"Failed: {failed}")
