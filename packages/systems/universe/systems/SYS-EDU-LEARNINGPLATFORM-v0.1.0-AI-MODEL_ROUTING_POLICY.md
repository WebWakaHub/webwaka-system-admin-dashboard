# AI Model Routing Policy Declaration
## System: `SYS-EDU-LEARNINGPLATFORM-v0.1.0`
**Issue:** #655
**Layer:** System
**Type:** AI-Native Governance Declaration
**Agent:** webwakaagent3
**Date:** 2026-02-25

---

## Purpose

This document declares the AI model routing policy for the `Learning Platform` system (`SYS-EDU-LEARNINGPLATFORM-v0.1.0`). It defines how AI model invocations are routed, prioritised, and governed within the system boundary.

## Routing Policy

All AI model invocations within `SYS-EDU-LEARNINGPLATFORM-v0.1.0` are subject to the following routing rules:

| Rule | Specification |
|------|---------------|
| **Primary Route** | SYSX-AI Orchestration Layer |
| **Fallback Route** | Vendor-Neutral AI Gateway |
| **Model Selection** | Capability-based, not vendor-locked |
| **Latency Budget** | ≤ 2000ms for synchronous calls |
| **Async Threshold** | Tasks > 5s MUST use async pattern |
| **Rate Limiting** | Per-tenant quotas enforced at gateway |

## Vendor Neutrality

Per the WebWaka Platform Doctrine (Vendor Neutral AI), this system does not bind to any single AI vendor. Model routing is abstracted through SYSX-AI to ensure portability across OpenAI, Anthropic, Google, and open-source models.

## Compliance

This declaration is constitutionally sealed under AGENT_EXECUTION_CONTEXT_MASTER_CONSTITUTION_v1.0.0.

**Executing Agent:** webwakaagent3
**Status:** ACTIVE ✅
