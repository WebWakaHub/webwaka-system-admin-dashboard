#!/usr/bin/env python3
"""Clean up stale/conflicting labels on AI Cognitive Fabric organelle issues."""

import requests
import time
import sys

TOKEN = "REDACTED_PAT"
REPO = "WebWakaHub/webwaka-organelle-universe"
HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

# Labels to remove from all AI Cognitive Fabric issues
LABELS_TO_REMOVE = [
    "execution:completed",
    "execution:template-only",
    "execution:reopened",
    "execution:awaiting-verification",
    "dep:handoff-pending",
]

# Issue ranges for the 4 AI Cognitive Fabric organelles
# Cognitive Port: #902-#930
# Prompt Assembler: #931-#959
# Result Validator: #960-#988
# Audit Emitter: #989-#1017
ISSUE_RANGES = [
    (902, 930),
    (931, 959),
    (960, 988),
    (989, 1017),
]

def remove_label(issue_num, label):
    """Remove a label from an issue."""
    url = f"https://api.github.com/repos/{REPO}/issues/{issue_num}/labels/{label}"
    resp = requests.delete(url, headers=HEADERS)
    return resp.status_code

def get_issue_labels(issue_num):
    """Get current labels for an issue."""
    url = f"https://api.github.com/repos/{REPO}/issues/{issue_num}"
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200:
        data = resp.json()
        return [l['name'] for l in data.get('labels', [])]
    return []

def main():
    total_removed = 0
    total_issues = 0
    
    for start, end in ISSUE_RANGES:
        for issue_num in range(start, end + 1):
            labels = get_issue_labels(issue_num)
            if not labels:
                print(f"  #{issue_num}: No labels or issue not found, skipping")
                continue
            
            total_issues += 1
            removed = []
            for label in LABELS_TO_REMOVE:
                if label in labels:
                    status = remove_label(issue_num, label)
                    if status in (200, 204):
                        removed.append(label)
                        total_removed += 1
                    else:
                        print(f"  #{issue_num}: Failed to remove '{label}' (status {status})")
                    time.sleep(0.3)  # Rate limiting
            
            if removed:
                print(f"  #{issue_num}: Removed {len(removed)} labels: {', '.join(removed)}")
            else:
                print(f"  #{issue_num}: No stale labels to remove")
            
            time.sleep(0.2)  # Rate limiting
    
    print(f"\nDone! Processed {total_issues} issues, removed {total_removed} stale labels.")

if __name__ == "__main__":
    main()
