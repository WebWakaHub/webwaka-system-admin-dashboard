# Fraud Prevention System - API Reference Guide

**Version:** 1.0.0  
**Date:** February 10, 2026  
**Status:** Production Ready

---

## Quick Start

### Authentication

All API requests require an API key in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.webwaka.com/fraud/system/status
```

### Base URL

```
https://api.webwaka.com/fraud
```

### Response Format

All responses follow a standard JSON format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "timestamp": "2026-02-10T10:30:00Z"
}
```

---

## API Endpoints Reference

### Transaction Scoring

#### POST /fraud/score-transaction

Score a transaction for fraud risk.

**Request:**
```bash
curl -X POST https://api.webwaka.com/fraud/score-transaction \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "id": "txn-001",
      "userId": "user-001",
      "amount": 50000,
      "merchantCategory": "grocery",
      "location": "Lagos, Nigeria",
      "device": "device-001",
      "timestamp": 1707557400000
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-001",
    "userId": "user-001",
    "score": 25,
    "riskLevel": "low",
    "factors": ["normal_amount", "safe_merchant"],
    "timestamp": 1707557400000
  }
}
```

**Parameters:**
- `transaction.id` (string, required) - Unique transaction ID
- `transaction.userId` (string, required) - User ID
- `transaction.amount` (number, required) - Transaction amount
- `transaction.merchantCategory` (string, required) - Merchant category
- `transaction.location` (string, required) - Transaction location
- `transaction.device` (string, required) - Device identifier
- `transaction.timestamp` (number, required) - Unix timestamp

**Response Fields:**
- `score` (0-100) - Fraud risk score
- `riskLevel` - Risk level (low, medium, high, critical)
- `factors` - Array of fraud factors identified

---

### Anomaly Detection

#### POST /fraud/detect-anomaly

Detect anomalies in user behavior.

**Request:**
```bash
curl -X POST https://api.webwaka.com/fraud/detect-anomaly \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "data": {
      "amount": 5000000,
      "merchantCategory": "cryptocurrency",
      "timestamp": 1707557400000,
      "device": "unknown-device",
      "location": "New York, USA"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-001",
    "isDeviation": true,
    "deviationScore": 85,
    "deviationReasons": [
      "unusual_amount",
      "unusual_merchant_category",
      "unusual_location"
    ],
    "timestamp": 1707557400000
  }
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `data.amount` (number, required) - Transaction amount
- `data.merchantCategory` (string, required) - Merchant category
- `data.timestamp` (number, required) - Unix timestamp
- `data.device` (string, optional) - Device identifier
- `data.location` (string, optional) - Location

**Response Fields:**
- `isDeviation` (boolean) - Whether deviation detected
- `deviationScore` (0-100) - Deviation severity score
- `deviationReasons` - Array of deviation reasons

---

### Velocity Checking

#### POST /fraud/check-velocity

Check transaction velocity limits.

**Request:**
```bash
curl -X POST https://api.webwaka.com/fraud/check-velocity \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "transaction": {
      "type": "transaction",
      "amount": 50000,
      "timestamp": 1707557400000
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-001",
    "violatesLimit": false,
    "currentVelocity": 150000,
    "limit": 500000,
    "timeWindow": "1h",
    "timestamp": 1707557400000
  }
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `transaction.type` (string, required) - Transaction type
- `transaction.amount` (number, required) - Transaction amount
- `transaction.timestamp` (number, required) - Unix timestamp

**Response Fields:**
- `violatesLimit` (boolean) - Whether limit violated
- `currentVelocity` - Current velocity
- `limit` - Velocity limit
- `timeWindow` - Time window for velocity check

---

### Account Monitoring

#### POST /fraud/monitor-account

Monitor account activity.

**Request:**
```bash
curl -X POST https://api.webwaka.com/fraud/monitor-account \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "activity": {
      "type": "login",
      "device": "device-001",
      "location": "Lagos, Nigeria",
      "timestamp": 1707557400000
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-001",
    "suspicious": false,
    "takeover_risk": 15,
    "reasons": [],
    "timestamp": 1707557400000
  }
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `activity.type` (string, required) - Activity type (login, logout, change_password, etc.)
- `activity.device` (string, required) - Device identifier
- `activity.location` (string, required) - Activity location
- `activity.timestamp` (number, required) - Unix timestamp

**Response Fields:**
- `suspicious` (boolean) - Whether activity is suspicious
- `takeover_risk` (0-100) - Account takeover risk score
- `reasons` - Array of suspicious reasons

---

### Behavioral Analysis

#### POST /fraud/analyze-behavior

Analyze user behavior patterns.

**Request:**
```bash
curl -X POST https://api.webwaka.com/fraud/analyze-behavior \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "data": {
      "amount": 50000,
      "merchantCategory": "grocery",
      "timestamp": 1707557400000,
      "device": "device-001",
      "location": "Lagos, Nigeria"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-001",
    "isDeviation": false,
    "deviationScore": 10,
    "deviationReasons": [],
    "behaviorProfile": {
      "avgAmount": 45000,
      "avgFrequency": "daily",
      "preferredMerchants": ["grocery", "pharmacy"],
      "preferredLocations": ["Lagos"]
    },
    "timestamp": 1707557400000
  }
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `data.amount` (number, required) - Transaction amount
- `data.merchantCategory` (string, required) - Merchant category
- `data.timestamp` (number, required) - Unix timestamp
- `data.device` (string, optional) - Device identifier
- `data.location` (string, optional) - Location

**Response Fields:**
- `isDeviation` (boolean) - Whether deviation detected
- `deviationScore` (0-100) - Deviation severity score
- `behaviorProfile` - User behavior profile

---

### Alert Management

#### POST /fraud/create-alert

Create a fraud alert.

**Request:**
```bash
curl -X POST https://api.webwaka.com/fraud/create-alert \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "type": "transaction",
    "severity": "high",
    "message": "High-risk transaction detected",
    "metadata": {
      "transactionId": "txn-001",
      "fraudScore": 75,
      "reason": "unusual_amount"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "userId": "user-001",
    "type": "transaction",
    "severity": "high",
    "message": "High-risk transaction detected",
    "status": "open",
    "createdAt": 1707557400000,
    "metadata": {
      "transactionId": "txn-001",
      "fraudScore": 75,
      "reason": "unusual_amount"
    }
  }
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `type` (string, required) - Alert type (transaction, account, behavior, compliance)
- `severity` (string, required) - Severity level (low, medium, high, critical)
- `message` (string, required) - Alert message
- `metadata` (object, optional) - Additional metadata

**Response Fields:**
- `id` - Alert ID
- `status` - Alert status (open, acknowledged, resolved)
- `createdAt` - Creation timestamp

---

#### GET /fraud/alerts

Get fraud alerts.

**Request:**
```bash
curl -X GET "https://api.webwaka.com/fraud/alerts?userId=user-001&status=open&limit=50" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "userId": "user-001",
        "type": "transaction",
        "severity": "high",
        "message": "High-risk transaction detected",
        "status": "open",
        "createdAt": 1707557400000
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

**Query Parameters:**
- `userId` (string, required) - User ID
- `status` (string, optional) - Alert status filter
- `limit` (number, optional) - Maximum results (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

---

#### PUT /fraud/alerts/{alertId}/acknowledge

Acknowledge an alert.

**Request:**
```bash
curl -X PUT https://api.webwaka.com/fraud/alerts/alert-001/acknowledge \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "acknowledgedBy": "admin-001"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "status": "acknowledged",
    "acknowledgedAt": 1707557400000,
    "acknowledgedBy": "admin-001"
  }
}
```

---

#### PUT /fraud/alerts/{alertId}/resolve

Resolve an alert.

**Request:**
```bash
curl -X PUT https://api.webwaka.com/fraud/alerts/alert-001/resolve \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "false_positive",
    "notes": "User confirmed legitimate transaction"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "status": "resolved",
    "resolvedAt": 1707557400000,
    "resolution": "false_positive"
  }
}
```

**Parameters:**
- `resolution` (string, required) - Resolution type (false_positive, confirmed_fraud, user_verified)
- `notes` (string, optional) - Resolution notes

---

### Compliance

#### GET /fraud/compliance/check

Check compliance status.

**Request:**
```bash
curl -X GET "https://api.webwaka.com/fraud/compliance/check?userId=user-001" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-001",
    "ndprCompliant": true,
    "cbnCompliant": true,
    "amlCompliant": true,
    "kycCompliant": true,
    "taxWithheld": 5000,
    "timestamp": 1707557400000
  }
}
```

**Query Parameters:**
- `userId` (string, required) - User ID

---

### System Management

#### GET /fraud/system/status

Get system status.

**Request:**
```bash
curl -X GET https://api.webwaka.com/fraud/system/status \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "components": {
      "transactionScorer": "operational",
      "anomalyDetector": "operational",
      "ruleEngine": "operational",
      "accountMonitor": "operational",
      "velocityChecker": "operational",
      "behavioralAnalyzer": "operational",
      "fraudAlertManager": "operational",
      "complianceManager": "operational"
    },
    "uptime": 99.99,
    "lastCheck": 1707557400000
  }
}
```

---

#### GET /fraud/system/metrics

Get system metrics.

**Request:**
```bash
curl -X GET https://api.webwaka.com/fraud/system/metrics \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionsProcessed": 1000000,
    "fraudsDetected": 5000,
    "alertsCreated": 4500,
    "averageResponseTime": 45,
    "successRate": 99.5,
    "timestamp": 1707557400000
  }
}
```

---

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.webwaka.com/fraud';

// Score a transaction
async function scoreTransaction(transaction) {
  try {
    const response = await axios.post(
      `${BASE_URL}/score-transaction`,
      { transaction },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error scoring transaction:', error);
    throw error;
  }
}

// Detect anomaly
async function detectAnomaly(userId, data) {
  try {
    const response = await axios.post(
      `${BASE_URL}/detect-anomaly`,
      { userId, data },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error detecting anomaly:', error);
    throw error;
  }
}

// Check velocity
async function checkVelocity(userId, transaction) {
  try {
    const response = await axios.post(
      `${BASE_URL}/check-velocity`,
      { userId, transaction },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking velocity:', error);
    throw error;
  }
}

// Usage
(async () => {
  const transaction = {
    id: 'txn-001',
    userId: 'user-001',
    amount: 50000,
    merchantCategory: 'grocery',
    location: 'Lagos, Nigeria',
    device: 'device-001',
    timestamp: Date.now()
  };

  const result = await scoreTransaction(transaction);
  console.log('Transaction Score:', result.data.score);
  console.log('Risk Level:', result.data.riskLevel);
})();
```

### Python

```python
import requests
import json

API_KEY = 'YOUR_API_KEY'
BASE_URL = 'https://api.webwaka.com/fraud'

def score_transaction(transaction):
    """Score a transaction for fraud risk"""
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        f'{BASE_URL}/score-transaction',
        json={'transaction': transaction},
        headers=headers
    )
    
    return response.json()

def detect_anomaly(user_id, data):
    """Detect anomalies in user behavior"""
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        f'{BASE_URL}/detect-anomaly',
        json={'userId': user_id, 'data': data},
        headers=headers
    )
    
    return response.json()

# Usage
transaction = {
    'id': 'txn-001',
    'userId': 'user-001',
    'amount': 50000,
    'merchantCategory': 'grocery',
    'location': 'Lagos, Nigeria',
    'device': 'device-001',
    'timestamp': int(time.time() * 1000)
}

result = score_transaction(transaction)
print(f"Transaction Score: {result['data']['score']}")
print(f"Risk Level: {result['data']['riskLevel']}")
```

### cURL

```bash
#!/bin/bash

API_KEY="YOUR_API_KEY"
BASE_URL="https://api.webwaka.com/fraud"

# Score a transaction
curl -X POST "${BASE_URL}/score-transaction" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "id": "txn-001",
      "userId": "user-001",
      "amount": 50000,
      "merchantCategory": "grocery",
      "location": "Lagos, Nigeria",
      "device": "device-001",
      "timestamp": '$(date +%s)'000
    }
  }'

# Detect anomaly
curl -X POST "${BASE_URL}/detect-anomaly" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "data": {
      "amount": 5000000,
      "merchantCategory": "cryptocurrency",
      "timestamp": '$(date +%s)'000,
      "device": "unknown-device",
      "location": "New York, USA"
    }
  }'

# Get alerts
curl -X GET "${BASE_URL}/alerts?userId=user-001&status=open" \
  -H "Authorization: Bearer ${API_KEY}"
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_TRANSACTION",
    "message": "Transaction data is invalid",
    "details": {
      "field": "amount",
      "reason": "Amount must be positive"
    }
  },
  "timestamp": "2026-02-10T10:30:00Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Invalid request format |
| INVALID_TRANSACTION | 400 | Invalid transaction data |
| INVALID_USER | 400 | Invalid user data |
| UNAUTHORIZED | 401 | Invalid API key |
| FORBIDDEN | 403 | Access denied |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Standard Tier:** 1,000 requests/minute
- **Premium Tier:** 10,000 requests/minute
- **Enterprise Tier:** Unlimited

Rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1707557460
```

---

## Webhooks

### Alert Webhook

Receive real-time alerts via webhook:

```json
{
  "event": "fraud.alert.created",
  "data": {
    "id": "alert-001",
    "userId": "user-001",
    "type": "transaction",
    "severity": "high",
    "message": "High-risk transaction detected",
    "timestamp": 1707557400000
  }
}
```

### Webhook Configuration

```bash
curl -X POST https://api.webwaka.com/fraud/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhooks/fraud",
    "events": ["fraud.alert.created", "fraud.alert.resolved"],
    "active": true
  }'
```

---

## Conclusion

The Fraud Prevention API provides comprehensive fraud detection capabilities. For additional support or questions, contact the WebWaka support team.

**Document Version:** 1.0.0  
**Last Updated:** February 10, 2026
