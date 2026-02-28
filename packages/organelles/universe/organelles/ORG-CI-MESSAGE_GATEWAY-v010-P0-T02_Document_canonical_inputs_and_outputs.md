# [ORG-CI-MESSAGE_GATEWAY-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #207 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Canonical Inputs

| # | Input Type | Key Fields |
|---|-----------|------------|
| 1 | RegisterChannelRequest | channel_id, channel_type, config, requesting_context |
| 2 | SendMessageRequest | message_id, channel_id, recipient, payload, idempotency_key, requesting_context |
| 3 | GetMessageRequest | message_id |
| 4 | ListMessagesRequest | channel_id, status_filter, cursor, limit |
| 5 | RetryMessageRequest | message_id, requesting_context |
| 6 | InboundMessageEvent | channel_id, source, payload, received_at |

## 2. Canonical Outputs

| # | Output Type | Fields |
|---|-----------|--------|
| 1 | ChannelConfig | channel_id, channel_type, config, created_at |
| 2 | Message | message_id, channel_id, recipient, payload, status, sent_at, delivered_at, error |
| 3 | MessagePage | messages[], next_cursor, total_count |
| 4 | InboundMessage | message_id, channel_id, source, payload, normalized_at |

## 3. Error Codes

| Code | Description |
|------|-------------|
| CHANNEL_NOT_FOUND | Channel not registered |
| MESSAGE_NOT_FOUND | Message does not exist |
| CHANNEL_ALREADY_REGISTERED | Channel ID already exists |
| DELIVERY_FAILED | Channel adapter returned error |
| DUPLICATE_MESSAGE | Idempotency key already used |
| INVALID_RECIPIENT | Recipient format invalid for channel |
| MESSAGE_NOT_RETRYABLE | Message in terminal state |

**Unblocks:** #208

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
