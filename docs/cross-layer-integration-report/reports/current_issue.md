# Current Issue: organelle-universe #465

## Issue Details
- **Title:** [ORG-IN-INSTRUMENTATION_PROBE-v0.1.0] Master Issue
- **Category:** IN — Instrumentation
- **Layer:** Organelle
- **Assigned Agent:** webwakaagent4 (Engineering & Delivery)
- **State:** open
- **Labels:** layer:organelle, type:master, assigned:webwakaagent4, state:active-wave-1, wave:1-foundation, dep:ready-for-execution, dep:handoff-pending, execution:template-only, execution:reopened

## Dependencies
- **Depends on:** #490 (which is ORG-IN-INSTRUMENTATION_PROBE-v0.1.0-P6 Ratification)
- **Unblocks:** #496

## IMPORTANT OBSERVATION
The Master Issue #465 depends on #490 (Ratification phase) — this means the master issue should be closed LAST, after all phases are complete. This is correct: the master tracks the component, and it closes when ratification (P6) is done.

But wait — #465 depends on #490 which is a LATER issue number. This means #465 cannot be executed until #490 is done. So #465 is NOT actually the first executable issue.

## Correct Execution Order for INSTRUMENTATION_PROBE
The phases should execute in order:
1. P0: Specification (#466-#469)
2. P1: Design (#470-#473)
3. P2: Internal Validation (#474-#477)
4. P3: Implementation (#478-#481)
5. P4: Verification (#482-#485)
6. P5: Documentation (#486-#489)
7. P6: Ratification (#490-#493)
8. Master Issue (#465) — closed last

Need to check which of the P0 task issues (#467, #468, #469) have their dependencies met.
