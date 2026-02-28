# [ORG-CI-MESSAGE_GATEWAY-v0.1.0-P5-T02] Create Usage Examples

**Issue:** #227 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Example 1: Send SMS Notification
Register SMS channel with provider config, then sendMessage with recipient phone number and text payload.

## Example 2: Send Email with Idempotency
sendMessage with idempotency_key to prevent duplicate emails on retry.

## Example 3: Webhook Delivery with Retry
Register HTTP webhook channel, send message, handle RETRYING state with exponential backoff.

## Example 4: Receive Inbound Webhook
receiveInbound() called by HTTP endpoint handler, normalizes and stores the message.

## Example 5: Offline Queue with SMS Fallback
Wire InMemoryMessageStorageAdapter for offline operation; queue messages locally and flush when online.

**Unblocks:** #228

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
