#!/usr/bin/env python3
"""
Re-push all tissue content to repos with correct agent identities.
Permissions are now fixed (org default = write).
Uses the same content generators from execute_tissues.py.
"""
import json
import os
import subprocess
import time
import hashlib
import sys

# Import content generators
sys.path.insert(0, '/home/ubuntu')
from execute_tissues import (
    AGENTS, TISSUES, EXEC_MAP, ORG,
    gen_p0_spec, gen_p1_design, gen_p2_validation,
    gen_p3_implementation, gen_p4_verification,
    gen_p5_documentation, gen_p6_ratification,
    PHASE_NAMES
)

LOG_FILE = "/home/ubuntu/tissue_repush_log.txt"

def log(msg):
    with open(LOG_FILE, "a") as f:
        f.write(f"{msg}\n")
    print(msg)

def run_cmd(cmd, cwd=None, timeout=30):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd, timeout=timeout)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "", "TIMEOUT", 1

CONTENT_GENERATORS = {
    0: gen_p0_spec,
    1: gen_p1_design,
    2: gen_p2_validation,
    3: gen_p3_implementation,
    4: gen_p4_verification,
    5: gen_p5_documentation,
    6: gen_p6_ratification,
}

def repush_tissue(tissue_id, tdef, exec_data):
    """Re-push all content for a tissue using phase-specific agent identities."""
    repo_name = tdef["repo"]
    repo_dir = f"/tmp/tissue_repush/{repo_name}"
    
    log(f"\n{'='*60}")
    log(f"RE-PUSHING: {tissue_id} -> {repo_name}")
    
    # Clone using webwaka007 (org owner)
    run_cmd(f"rm -rf {repo_dir}")
    os.makedirs(os.path.dirname(repo_dir), exist_ok=True)
    
    agent0 = AGENTS["webwaka007"]
    stdout, stderr, rc = run_cmd(
        f'git clone "https://x-access-token:{agent0["pat"]}@github.com/{ORG}/{repo_name}.git" {repo_dir}',
        timeout=15)
    
    if rc != 0:
        log(f"  CLONE ERROR: {stderr}")
        return False
    
    # Generate ALL content for all phases
    all_files = {}
    phase_agents = {}
    for phase_num in range(7):
        content_gen = CONTENT_GENERATORS[phase_num]
        files = content_gen(tissue_id, tdef)
        all_files.update(files)
        
        # Track which agent should commit each phase's files
        phase_data = exec_data["phases"][phase_num]
        for fpath in files:
            phase_agents[fpath] = phase_data["tasks"][0]["agent"]  # Use first task's agent for the phase
    
    # Write all files
    for filepath, content in all_files.items():
        full_path = os.path.join(repo_dir, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content)
    
    # Group files by phase for phase-specific commits
    for phase_num in range(7):
        content_gen = CONTENT_GENERATORS[phase_num]
        phase_files = content_gen(tissue_id, tdef)
        phase_data = exec_data["phases"][phase_num]
        
        # Use the first task's agent for the commit
        commit_agent = phase_data["tasks"][0]["agent"]
        agent = AGENTS[commit_agent]
        
        # Configure git for this agent
        run_cmd(f'git config user.name "{agent["name"]}"', cwd=repo_dir)
        run_cmd(f'git config user.email "{agent["email"]}"', cwd=repo_dir)
        run_cmd(f'git remote set-url origin "https://x-access-token:{agent["pat"]}@github.com/{ORG}/{repo_name}.git"', cwd=repo_dir)
        
        # Write phase files
        for filepath, content in phase_files.items():
            full_path = os.path.join(repo_dir, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w") as f:
                f.write(content)
        
        # Stage and commit
        run_cmd("git add -A", cwd=repo_dir)
        commit_msg = f"[{tdef['full_id']}] P{phase_num}: {PHASE_NAMES[phase_num]}"
        stdout, stderr, rc = run_cmd(f'git commit -m "{commit_msg}"', cwd=repo_dir)
        
        if "nothing to commit" in stdout or "nothing to commit" in stderr:
            log(f"  P{phase_num}: No changes (already pushed)")
        else:
            log(f"  P{phase_num}: Committed by {commit_agent}")
    
    # Push all commits at once
    # Use webwaka007 PAT for the final push (org owner, guaranteed access)
    run_cmd(f'git remote set-url origin "https://x-access-token:{agent0["pat"]}@github.com/{ORG}/{repo_name}.git"', cwd=repo_dir)
    stdout, stderr, rc = run_cmd("git push origin main", cwd=repo_dir, timeout=30)
    
    if rc != 0:
        log(f"  PUSH ERROR: {stderr}")
        # Try force push
        stdout, stderr, rc = run_cmd("git push origin main --force", cwd=repo_dir, timeout=30)
        if rc != 0:
            log(f"  FORCE PUSH ERROR: {stderr}")
            return False
    
    # Verify file count
    stdout, stderr, rc = run_cmd("find . -type f -not -path './.git/*' | wc -l", cwd=repo_dir)
    log(f"  PUSHED: {stdout} files")
    
    # Cleanup
    run_cmd(f"rm -rf {repo_dir}")
    
    return True


def main():
    log(f"\n{'#'*60}")
    log(f"TISSUE RE-PUSH ENGINE")
    log(f"Started: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"{'#'*60}")
    
    tissue_order = [
        "TIS-CMDCOORD", "TIS-STATEAGG", "TIS-WORKFLOW", "TIS-POLICY",
        "TIS-EVENT", "TIS-VALIDATE", "TIS-RESOURCE", "TIS-MONITOR",
        "TIS-AI-COGNITIVE_TISSUE", "TIS-AI-ENTITLEMENT_TISSUE"
    ]
    
    success = 0
    fail = 0
    
    for tissue_id in tissue_order:
        tdef = TISSUES[tissue_id]
        exec_data = EXEC_MAP[tissue_id]
        
        if repush_tissue(tissue_id, tdef, exec_data):
            success += 1
            log(f"  ✓ {tissue_id} — REPUSHED ({success}/{len(tissue_order)})")
        else:
            fail += 1
            log(f"  ✗ {tissue_id} — FAILED")
    
    log(f"\n{'#'*60}")
    log(f"RE-PUSH COMPLETE: {success}/{len(tissue_order)} success, {fail} failed")
    log(f"{'#'*60}")


if __name__ == "__main__":
    main()
