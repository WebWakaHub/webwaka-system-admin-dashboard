# [ORG-ST-TRUST_ASSERTION-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #120 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Canonical Inputs

| # | Input Type | Key Fields | Description |
|---|-----------|------------|-------------|
| 1 | CreateAssertionRequest | subject_id, claim, signing_key_id, expiry, scope, requesting_context | Create signed assertion |
| 2 | VerifyAssertionRequest | assertion_token, trust_anchor_ids | Verify assertion signature and chain |
| 3 | RegisterTrustAnchorRequest | anchor_name, public_key, algorithm, requesting_context | Register trust anchor |
| 4 | RevokeAssertionRequest | assertion_id, reason, requesting_context | Revoke an assertion |
| 5 | GenerateKeyPairRequest | algorithm, key_size, requesting_context | Generate signing key pair |
| 6 | ListAssertionsRequest | subject_id, cursor, limit | List assertions for a subject |
| 7 | ValidateChainRequest | assertion_tokens[], trust_anchor_ids | Validate certificate chain |

## 2. Canonical Outputs

| # | Output Type | Fields |
|---|-----------|--------|
| 1 | TrustAssertion | assertion_id, subject_id, claim, signature, issuer_key_id, issued_at, expires_at, scope, state |
| 2 | VerificationResult | valid (bool), assertion_id, chain_depth, reasons[], verified_at |
| 3 | KeyPair | key_id, public_key, algorithm, created_at |
| 4 | TrustAnchor | anchor_id, anchor_name, public_key, algorithm, state |

## 3. Error Codes

| Code | Description |
|------|-------------|
| ASSERTION_NOT_FOUND | Assertion ID does not exist |
| ASSERTION_EXPIRED | Assertion has passed its expiry time |
| ASSERTION_REVOKED | Assertion has been revoked |
| INVALID_SIGNATURE | Cryptographic signature verification failed |
| TRUST_ANCHOR_NOT_FOUND | Referenced trust anchor does not exist |
| KEY_NOT_FOUND | Signing key ID does not exist |
| CHAIN_VALIDATION_FAILED | Certificate chain is broken or untrusted |
| UNSUPPORTED_ALGORITHM | Requested algorithm not supported |

**Unblocks:** #121

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
