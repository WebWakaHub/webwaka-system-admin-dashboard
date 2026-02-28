# AI Abstraction Layer - API Reference & Usage Guide

**Version:** 1.0.0  
**Last Updated:** February 10, 2026

---

## Quick Start

### 1. Installation

```bash
npm install @webwaka/ai-abstraction-layer
```

### 2. Initialize

```typescript
import { AIAbstractionLayer } from '@webwaka/ai-abstraction-layer';

const aiLayer = new AIAbstractionLayer({
  providers: {
    openrouter: {
      apiKey: 'sk_live_...'
    }
  }
});

await aiLayer.initialize();
```

### 3. Make Your First Request

```typescript
const response = await aiLayer.executeRequest({
  provider: 'openrouter',
  model: 'gpt-4',
  prompt: 'Hello, world!'
});

console.log(response.response);
```

---

## API Endpoints

### 1. Execute Request

Execute an AI request through the abstraction layer.

**Endpoint:** `POST /api/v1/ai-abstraction-layer/execute`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "provider": "openrouter",
  "model": "gpt-4",
  "prompt": "What is the capital of France?",
  "temperature": 0.7,
  "maxTokens": 100,
  "topP": 0.95,
  "frequencyPenalty": 0,
  "presencePenalty": 0,
  "cache": {
    "enabled": true,
    "ttl": 3600000
  },
  "customKey": "key_123456"
}
```

**Response (200 OK):**
```json
{
  "requestId": "req_123456",
  "provider": "openrouter",
  "model": "gpt-4",
  "response": "The capital of France is Paris.",
  "tokens": {
    "input": 8,
    "output": 7
  },
  "cost": 0.00015,
  "cached": false,
  "duration": 245,
  "timestamp": "2026-02-10T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication failed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

### 2. Get Request

Retrieve details of a previous request.

**Endpoint:** `GET /api/v1/ai-abstraction-layer/requests/:requestId`

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "requestId": "req_123456",
  "provider": "openrouter",
  "model": "gpt-4",
  "prompt": "What is the capital of France?",
  "response": "The capital of France is Paris.",
  "status": "completed",
  "tokens": {
    "input": 8,
    "output": 7
  },
  "cost": 0.00015,
  "createdAt": "2026-02-10T10:00:00Z",
  "completedAt": "2026-02-10T10:00:00.245Z"
}
```

---

### 3. List Requests

List all requests with filtering and pagination.

**Endpoint:** `GET /api/v1/ai-abstraction-layer/requests`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `limit` (optional, default: 10, max: 100) - Number of results
- `offset` (optional, default: 0) - Offset for pagination
- `provider` (optional) - Filter by provider
- `model` (optional) - Filter by model
- `status` (optional) - Filter by status (pending, completed, failed)
- `startDate` (optional) - Filter by start date (ISO 8601)
- `endDate` (optional) - Filter by end date (ISO 8601)

**Response (200 OK):**
```json
{
  "requests": [
    {
      "requestId": "req_123456",
      "provider": "openrouter",
      "model": "gpt-4",
      "status": "completed",
      "createdAt": "2026-02-10T10:00:00Z"
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

---

### 4. Delete Request

Delete a request and its associated data.

**Endpoint:** `DELETE /api/v1/ai-abstraction-layer/requests/:requestId`

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Request deleted successfully"
}
```

---

### 5. Create API Key

Create a new API key for BYOK support.

**Endpoint:** `POST /api/v1/ai-abstraction-layer/keys`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "My OpenRouter Key",
  "provider": "openrouter",
  "apiKey": "sk_live_...",
  "expiresIn": 2592000000
}
```

**Response (201 Created):**
```json
{
  "keyId": "key_123456",
  "key": "sk_live_...",
  "name": "My OpenRouter Key",
  "provider": "openrouter",
  "createdAt": "2026-02-10T10:00:00Z",
  "expiresAt": "2026-03-12T10:00:00Z"
}
```

---

### 6. List API Keys

List all API keys for the authenticated user.

**Endpoint:** `GET /api/v1/ai-abstraction-layer/keys`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `limit` (optional, default: 10) - Number of results
- `offset` (optional, default: 0) - Offset for pagination
- `provider` (optional) - Filter by provider

**Response (200 OK):**
```json
{
  "keys": [
    {
      "keyId": "key_123456",
      "name": "My OpenRouter Key",
      "provider": "openrouter",
      "createdAt": "2026-02-10T10:00:00Z",
      "expiresAt": "2026-03-12T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

---

### 7. Get Statistics

Get usage statistics and analytics.

**Endpoint:** `GET /api/v1/ai-abstraction-layer/statistics`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `startDate` (optional) - Start date (ISO 8601)
- `endDate` (optional) - End date (ISO 8601)
- `provider` (optional) - Filter by provider
- `model` (optional) - Filter by model
- `granularity` (optional) - Granularity (hourly, daily, weekly, monthly)

**Response (200 OK):**
```json
{
  "period": {
    "startDate": "2026-02-03T10:00:00Z",
    "endDate": "2026-02-10T10:00:00Z"
  },
  "summary": {
    "totalRequests": 1000,
    "totalCost": 15.50,
    "averageResponseTime": 245,
    "cacheHitRate": 0.92,
    "errorRate": 0.01
  },
  "providers": {
    "openrouter": {
      "requests": 1000,
      "cost": 15.50,
      "averageResponseTime": 245
    }
  },
  "models": {
    "gpt-4": {
      "requests": 500,
      "cost": 10.00,
      "averageResponseTime": 250
    },
    "gpt-3.5": {
      "requests": 500,
      "cost": 5.50,
      "averageResponseTime": 240
    }
  }
}
```

---

### 8. Get System Health

Get system health status and component status.

**Endpoint:** `GET /api/v1/ai-abstraction-layer/health`

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "status": "healthy",
  "uptime": 86400000,
  "version": "1.0.0",
  "components": {
    "database": {
      "status": "healthy",
      "responseTime": 5
    },
    "cache": {
      "status": "healthy",
      "responseTime": 2
    },
    "openrouter": {
      "status": "healthy",
      "responseTime": 245
    }
  }
}
```

---

## Code Examples

### JavaScript/TypeScript

#### Basic Request

```typescript
import { AIAbstractionLayer } from '@webwaka/ai-abstraction-layer';

const aiLayer = new AIAbstractionLayer({
  providers: {
    openrouter: {
      apiKey: 'sk_live_...'
    }
  }
});

await aiLayer.initialize();

const response = await aiLayer.executeRequest({
  provider: 'openrouter',
  model: 'gpt-4',
  prompt: 'What is the capital of France?'
});

console.log(response.response);
```

#### With Error Handling

```typescript
try {
  const response = await aiLayer.executeRequest({
    provider: 'openrouter',
    model: 'gpt-4',
    prompt: 'Hello, world!'
  });
  console.log(response.response);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.log('Rate limit exceeded, retrying...');
  } else if (error.code === 'PROVIDER_UNAVAILABLE') {
    console.log('Provider unavailable, trying fallback...');
  } else {
    console.error('Error:', error.message);
  }
}
```

#### With Caching

```typescript
const response = await aiLayer.executeRequest({
  provider: 'openrouter',
  model: 'gpt-4',
  prompt: 'What is the capital of France?',
  cache: {
    enabled: true,
    ttl: 3600000  // 1 hour
  }
});

console.log('Cached:', response.cached);
console.log('Duration:', response.duration, 'ms');
```

### Python

```python
import requests
import json

API_KEY = "sk_live_..."
BASE_URL = "https://api.example.com/api/v1/ai-abstraction-layer"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "provider": "openrouter",
    "model": "gpt-4",
    "prompt": "What is the capital of France?"
}

response = requests.post(
    f"{BASE_URL}/execute",
    headers=headers,
    json=data
)

result = response.json()
print(result['response'])
```

### cURL

```bash
curl -X POST https://api.example.com/api/v1/ai-abstraction-layer/execute \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openrouter",
    "model": "gpt-4",
    "prompt": "What is the capital of France?"
  }'
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "model",
      "reason": "Model not found"
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Authentication failed |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| PROVIDER_UNAVAILABLE | 503 | Provider unavailable |
| INTERNAL_ERROR | 500 | Internal server error |

---

## Rate Limiting

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1644484800
```

### Rate Limit Tiers

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|-----------------|---------------|--------------|
| Free | 10 | 600 | 10,000 |
| Pro | 60 | 3,600 | 100,000 |
| Enterprise | 600 | 36,000 | 1,000,000 |

---

## Authentication

### Bearer Token

```
Authorization: Bearer <API_KEY>
```

### API Key Format

```
sk_live_... (production)
sk_test_... (testing)
```

---

## Webhooks

### Request Completed

Receive a webhook when a request completes.

**Event:** `request.completed`

**Payload:**
```json
{
  "event": "request.completed",
  "requestId": "req_123456",
  "provider": "openrouter",
  "model": "gpt-4",
  "response": "The capital of France is Paris.",
  "cost": 0.00015,
  "timestamp": "2026-02-10T10:00:00Z"
}
```

---

## Pagination

### Cursor-Based Pagination

Use `limit` and `offset` for pagination:

```
GET /requests?limit=10&offset=0
```

### Response Format

```json
{
  "items": [...],
  "total": 100,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

---

## Versioning

The API uses URL-based versioning:

- Current Version: `v1`
- URL: `/api/v1/ai-abstraction-layer/...`

---

## Support

For API support, contact:
- Email: api-support@example.com
- Discord: [Community Server](https://discord.gg/example)
- GitHub: [Issues](https://github.com/WebWakaHub/webwaka-platform/issues)

---

**Version:** 1.0.0  
**Last Updated:** February 10, 2026  
**Status:** Production Ready
