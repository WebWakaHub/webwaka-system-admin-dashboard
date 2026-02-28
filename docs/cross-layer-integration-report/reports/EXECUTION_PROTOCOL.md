# WebWaka Execution Protocol — HARDCODED REFERENCE

## 8-Step Execution Protocol (PER ISSUE)

1. **Find next executable issue** — check exists, assigned agent, dependencies satisfied, milestone
2. **Identify agent identity** — from `assigned:` label → look up in CANONICAL_AGENT_SPECIFICATION
3. **SWITCH to that agent's PAT** — ALL commits, comments, labels, pushes use THAT agent's PAT
4. **Load full context** — constitutions + issue body + linked structures
5. **Implement** — with agent identity, agent PAT, agent commit signature
6. **Update issue state** — with agent PAT (comment, label, close)
7. **Unlock dependencies** — verify downstream issues are unblocked
8. **Return to Step 1** — switch agent if needed

## 7-Phase Lifecycle (PER COMPONENT)

| Phase | Name | Deliverable |
|:---|:---|:---|
| P0 | Specification | T01, T02, T03 → Phase closure |
| P1 | Design | T01, T02, T03 → Phase closure |
| P2 | Internal Validation | T01, T02, T03 → Phase closure |
| P3 | Implementation | T01, T02, T03 → Phase closure |
| P4 | Verification | T01, T02, T03 → Phase closure |
| P5 | Documentation | T01, T02, T03 → Phase closure |
| P6 | Ratification | T01, T02, T03 → Phase closure → Master Issue closure |

## Agent PATs

| Agent | PAT |
|:---|:---|
| webwaka007 | REDACTED_PAT |
| webwakaagent1 | REDACTED_PAT |
| webwakaagent2 | REDACTED_PAT |
| webwakaagent3 | REDACTED_PAT |
| webwakaagent4 | REDACTED_PAT |
| webwakaagent5 | REDACTED_PAT |
| webwakaagent6 | REDACTED_PAT |
| webwakaagent7 | REDACTED_PAT |
| webwakaagent8 | REDACTED_PAT |
| webwakaagent9 | REDACTED_PAT |
| webwakaagent10 | REDACTED_PAT |

## Rules

- NO phase skipping
- NO task skipping
- NO batch shortcuts
- Each task gets REAL deliverables
- Agent PAT switches happen at EVERY agent boundary
- Phase issue closes ONLY after all 3 tasks are closed
- Master issue closes ONLY after P6 ratification is complete
