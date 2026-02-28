# [ORG-ES-SCHEDULER_EXECUTOR-v0.1.0-P5-T02] Create Usage Examples

**Issue:** #169 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Example 1: One-Time Delayed Task
Schedule a payment reminder email 24 hours after signup.

## Example 2: Recurring Cron Task
Schedule a daily report generation at 9am on weekdays.

## Example 3: Retry with Exponential Backoff
Schedule an API sync with 3 retries and exponential backoff starting at 5 seconds.

## Example 4: Priority Queue
Schedule a P0 (critical) alert alongside P5 (routine) batch job; verify P0 executes first.

## Example 5: Offline Queue
Wire with InMemorySchedulerStorageAdapter and InMemoryQueueAdapter for offline PWA operation.

**Unblocks:** #170

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
