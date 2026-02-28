#!/usr/bin/env python3
"""
Thoroughly review all 381 dormant/archive issues in organ-universe.
Determine if they are duplications of the 56 active organs or unique organs needing activation.
"""
import json
import os
import re
from collections import defaultdict

# Load all issues
issues = []
for page in range(1, 27):
    path = f'/home/ubuntu/organ_data/issues_page_{page}.json'
    if os.path.exists(path):
        data = json.load(open(path))
        if isinstance(data, list):
            issues.extend(data)

# Separate archive from active
archive_issues = [i for i in issues if 'ARCHIVE' in i.get('title', '')]
active_issues = [i for i in issues if 'ARCHIVE' not in i.get('title', '')]

print(f"Total issues: {len(issues)}")
print(f"Active issues: {len(active_issues)}")
print(f"Archive/dormant issues: {len(archive_issues)}")

# Get the 56 active organ IDs
active_organ_ids = set()
for issue in active_issues:
    title = issue.get("title", "")
    m = re.match(r'^\[([A-Z0-9_-]+)-v[\d.]+', title)
    if m:
        active_organ_ids.add(m.group(1))

print(f"\nActive organ IDs: {len(active_organ_ids)}")

# Analyze archive issues
print(f"\n{'='*80}")
print("DORMANT ISSUE ANALYSIS")
print(f"{'='*80}")

# Extract organ references from dormant issues
dormant_organs = defaultdict(list)
dormant_labels = defaultdict(int)
dormant_types = defaultdict(int)

for issue in archive_issues:
    title = issue.get("title", "")
    num = issue["number"]
    labels = [l["name"] for l in issue.get("labels", [])]
    body = issue.get("body", "") or ""
    
    # Track labels
    for label in labels:
        dormant_labels[label] += 1
    
    # Extract organ ID from title or body
    organ_refs = re.findall(r'ORGX-[A-Z]+-[A-Z_]+', title + " " + body)
    
    if organ_refs:
        for ref in set(organ_refs):
            dormant_organs[ref].append({
                "issue": num,
                "title": title[:100],
                "labels": labels,
            })
    
    # Classify type
    if "Master" in title or "type:master" in str(labels):
        dormant_types["master"] += 1
    elif "Phase" in title or any("phase:" in l for l in labels):
        dormant_types["phase"] += 1
    elif "Atomic Task" in title or "structural:overflow" in str(labels):
        dormant_types["task"] += 1
    else:
        dormant_types["other"] += 1

print(f"\nDormant issue types:")
for t, count in sorted(dormant_types.items()):
    print(f"  {t}: {count}")

print(f"\nDormant labels:")
for label, count in sorted(dormant_labels.items(), key=lambda x: -x[1]):
    print(f"  {label}: {count}")

print(f"\nOrgan IDs referenced in dormant issues: {len(dormant_organs)}")

# Compare dormant organ refs against active organs
unique_dormant = set()
duplicate_dormant = set()

for organ_ref in dormant_organs:
    if organ_ref in active_organ_ids:
        duplicate_dormant.add(organ_ref)
    else:
        unique_dormant.add(organ_ref)

print(f"\n{'='*80}")
print("COMPARISON RESULTS")
print(f"{'='*80}")
print(f"\nDormant organs that DUPLICATE active organs: {len(duplicate_dormant)}")
for oid in sorted(duplicate_dormant):
    count = len(dormant_organs[oid])
    print(f"  {oid}: {count} dormant issues (DUPLICATE of active)")

print(f"\nDormant organs NOT in active set (UNIQUE): {len(unique_dormant)}")
for oid in sorted(unique_dormant):
    count = len(dormant_organs[oid])
    print(f"  {oid}: {count} dormant issues")
    for item in dormant_organs[oid][:3]:
        print(f"    #{item['issue']}: {item['title']}")

# Check for dormant issues with no organ reference at all
no_ref = [i for i in archive_issues if not re.findall(r'ORGX-[A-Z]+-[A-Z_]+', (i.get("title", "") + " " + (i.get("body", "") or "")))]
print(f"\nDormant issues with NO organ reference: {len(no_ref)}")
for item in no_ref[:10]:
    print(f"  #{item['number']}: {item['title'][:80]}")

# Final determination
print(f"\n{'='*80}")
print("FINAL DETERMINATION")
print(f"{'='*80}")

if unique_dormant:
    print(f"\n⚠ {len(unique_dormant)} UNIQUE dormant organs found that are NOT in the active set.")
    print("These may need to be activated for implementation:")
    for oid in sorted(unique_dormant):
        print(f"  - {oid}")
else:
    print("\n✓ ALL dormant organ references are duplications of the 56 active organs.")
    print("  No activation needed — dormant issues can remain as-is.")

# Save report
with open("/home/ubuntu/organ_data/dormant_analysis.txt", "w") as f:
    f.write(f"DORMANT ISSUE ANALYSIS REPORT\n")
    f.write(f"{'='*60}\n\n")
    f.write(f"Total dormant issues: {len(archive_issues)}\n")
    f.write(f"Active organ IDs: {len(active_organ_ids)}\n")
    f.write(f"Dormant organ references: {len(dormant_organs)}\n")
    f.write(f"Duplicates of active: {len(duplicate_dormant)}\n")
    f.write(f"Unique (not in active): {len(unique_dormant)}\n\n")
    
    if unique_dormant:
        f.write("UNIQUE DORMANT ORGANS (need activation):\n")
        for oid in sorted(unique_dormant):
            f.write(f"  {oid}:\n")
            for item in dormant_organs[oid]:
                f.write(f"    #{item['issue']}: {item['title']}\n")
    else:
        f.write("CONCLUSION: All dormant issues are duplications. No activation needed.\n")
    
    f.write(f"\nDuplicate dormant organs:\n")
    for oid in sorted(duplicate_dormant):
        f.write(f"  {oid}: {len(dormant_organs[oid])} dormant issues\n")

print(f"\nReport saved to /home/ubuntu/organ_data/dormant_analysis.txt")
