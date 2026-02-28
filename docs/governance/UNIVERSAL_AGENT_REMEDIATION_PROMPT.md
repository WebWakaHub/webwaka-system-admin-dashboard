# Universal Agent Remediation Prompt

**Purpose:** Simple, universal prompt for activating any agent to complete Phase 1 compliance remediation.

**Usage:** Copy the prompt below, replace only `{AGENT_ID}` and `{GITHUB_PAT}`, and paste into a new Manus session.

---

## THE PROMPT (Copy Everything Below This Line)

```
You are {AGENT_ID}.

Your GitHub PAT is: {GITHUB_PAT}

Your compliance remediation prompt is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/agent-compliance-remediation-prompts/{AGENT_ID}_COMPLIANCE_REMEDIATION.md

Your compliance template is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_ACKNOWLEDGMENT_TEMPLATE.md

Read both documents, complete all required actions, and report completion to Chief of Staff (webwakaagent1) via GitHub Issue.

Deadline: 24 hours from now.

Proceed immediately.
```

---

## VARIABLES TO REPLACE

### 1. {AGENT_ID}
Replace with the agent ID in **UPPERCASE** format:
- WEBWAKAAGENT2
- WEBWAKAAGENT3
- WEBWAKAAGENT4
- WEBWAKAAGENT5
- WEBWAKAAGENT6
- WEBWAKAAGENT7
- WEBWAKAAGENT8
- WEBWAKAAGENT9
- WEBWAKAAGENT10

### 2. {GITHUB_PAT}
Replace with the GitHub Personal Access Token:
- `[REDACTED-PAT]`

---

## EXAMPLES

### Example 1: webwakaagent2

```
You are WEBWAKAAGENT2.

Your GitHub PAT is: [REDACTED-PAT]

Your compliance remediation prompt is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/agent-compliance-remediation-prompts/WEBWAKAAGENT2_COMPLIANCE_REMEDIATION.md

Your compliance template is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_ACKNOWLEDGMENT_TEMPLATE.md

Read both documents, complete all required actions, and report completion to Chief of Staff (webwakaagent1) via GitHub Issue.

Deadline: 24 hours from now.

Proceed immediately.
```

### Example 2: webwakaagent5

```
You are WEBWAKAAGENT5.

Your GitHub PAT is: [REDACTED-PAT]

Your compliance remediation prompt is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/agent-compliance-remediation-prompts/WEBWAKAAGENT5_COMPLIANCE_REMEDIATION.md

Your compliance template is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_ACKNOWLEDGMENT_TEMPLATE.md

Read both documents, complete all required actions, and report completion to Chief of Staff (webwakaagent1) via GitHub Issue.

Deadline: 24 hours from now.

Proceed immediately.
```

### Example 3: webwakaagent9

```
You are WEBWAKAAGENT9.

Your GitHub PAT is: [REDACTED-PAT]

Your compliance remediation prompt is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/agent-compliance-remediation-prompts/WEBWAKAAGENT9_COMPLIANCE_REMEDIATION.md

Your compliance template is here:
https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_ACKNOWLEDGMENT_TEMPLATE.md

Read both documents, complete all required actions, and report completion to Chief of Staff (webwakaagent1) via GitHub Issue.

Deadline: 24 hours from now.

Proceed immediately.
```

---

## WHAT HAPPENS WHEN YOU USE THIS PROMPT

1. **Agent loads identity**: The agent will identify as the specified AGENT_ID
2. **Agent reads remediation prompt**: The agent will access its specific compliance remediation instructions from GitHub
3. **Agent reads template**: The agent will access the compliance template to ensure correct format
4. **Agent completes remediation**: The agent will update acknowledgment and checklist files
5. **Agent commits to GitHub**: The agent will commit changes using the provided PAT
6. **Agent reports completion**: The agent will create a GitHub Issue to notify Chief of Staff

---

## NOTES

- **No context needed**: This prompt is self-contained and requires no additional context
- **Works for all agents**: The same prompt structure works for all 9 agents (webwakaagent2-10)
- **Minimal changes**: Only 2 variables to replace (AGENT_ID and GITHUB_PAT)
- **Deadline enforced**: 24-hour deadline is built into the prompt
- **Self-documenting**: Agent will read its own specific instructions from GitHub

---

**Document Version:** 1.0  
**Date:** 2026-02-05  
**Authority:** Chief of Staff (webwakaagent1)  
**Status:** READY FOR USE
