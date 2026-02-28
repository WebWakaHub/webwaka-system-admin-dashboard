# LSVR-04 Organ Anomaly Classification

**Protocol:** LSVR-04 — Organ Layer Verification (Read-Only)
**Generated:** 2026-02-21 02:54:17 UTC

---

## Anomaly Summary

| Anomaly Type | Count | Severity |
| :--- | :--- | :--- |
| Ghost Duplicates | 0 | None |
| Legacy-Format Archived Issues | 381 | Informational |
| Orphan Issues (no structure ID) | 0 | None |
| Cross-Domain ID Mismatches | 2 | Minor |
| Improper Label Usage | 2 | Minor |
| UNDERFLOW Structures | 3 | Major |
| OVERFLOW Structures | 0 | None |

---

## Anomaly Detail

### 1. Ghost Duplicates

**Count: 0**

No ghost duplicates detected. The LSVR-02A protocol successfully resolved all ghost duplicates in the cell layer; the organ layer was not affected.

---

### 2. Legacy-Format Archived Issues

**Count: 381**

These are issues archived by the CSRP-01 protocol. They carry the `csrp:archived` label and were prefixed with `[ARCHIVE-CSRP01]`. They represent pre-canonical legacy content and are correctly archived. No action required.

---

### 3. Cross-Domain ID Mismatches

**Count: 2**

Two issues carry the `layer:organ` label but have structure IDs that do not conform to the `ORGX-` namespace:

| Issue # | Title | Anomaly |
| :--- | :--- | :--- |
| #882 | `[RATE-LIMIT-TEST] Testing Block Status` | Test artifact — not a real organ structure |
| #1882 | `[RETRY-TEST] Rate Limit Check` | Test artifact — not a real organ structure |

These are rate-limit test issues created during the CSRP-01 Phase 3 transfer operations. They were inadvertently labeled `layer:organ` and should be archived in a future repair protocol.

---

### 4. Improper Label Usage

**Count: 2**

The same 2 test artifact issues (#882 and #1882) lack the required `state:dormant` or `state:active` label.

---

### 5. UNDERFLOW Structures

**Count: 3**

| Structure ID | Active Issues | Missing | Root Cause |
| :--- | :--- | :--- | :--- |
| `ORGX-HLT-PATIENT_MANAGEMENT-v0.1.0` | 7 | 22 | Incomplete bulk generation |
| `RATE-LIMIT-TEST` | 1 | N/A | Test artifact |
| `RETRY-TEST` | 1 | N/A | Test artifact |

The `ORGX-HLT-PATIENT_MANAGEMENT-v0.1.0` structure is a genuine organ structure that was only partially generated. It has 1 master, 2 phase issues, and 4 task issues — missing 22 canonical issues.

The `RATE-LIMIT-TEST` and `RETRY-TEST` entries are test artifacts that should not be counted as canonical structures.

---

## Adjusted Mathematical Reconciliation

Excluding the 2 test artifacts from the structure count:

| Metric | Value |
| :--- | :--- |
| True Canonical Structures | 56 (58 detected - 2 test artifacts) |
| Expected Issues (56 × 29) | 1,624 |
| Actual Issues (excluding test artifacts) | 1,602 |
| Delta | -22 (ORGX-HLT-PATIENT_MANAGEMENT missing 22) |

Alternatively, if the 2 test artifacts are treated as the 2 missing structures from the expected 58:

| Metric | Value |
| :--- | :--- |
| Canonical Structures (ORGX- namespace) | 56 |
| COMPLETE Structures | 55 |
| UNDERFLOW Structures | 1 (ORGX-HLT-PATIENT_MANAGEMENT) |
| Missing Issues | 22 |
