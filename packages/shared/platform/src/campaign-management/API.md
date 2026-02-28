# Campaign Management API Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2026-02-12

---

## API Endpoints

### Campaign Endpoints

#### 1. Create Campaign
```
POST /api/v1/campaigns
Content-Type: application/json

Request Body:
{
  "name": "Welcome Campaign",
  "description": "Welcome new users",
  "channels": ["email", "sms"],
  "targetAudience": {
    "segmentId": "seg-123"
  },
  "content": {
    "email": {
      "templateId": "tpl-123",
      "subject": "Welcome!"
    }
  },
  "scheduling": {
    "type": "one_time",
    "startDate": "2026-02-15",
    "startTime": "10:00"
  }
}

Response (201 Created):
{
  "id": "camp-123",
  "tenantId": "tenant-123",
  "name": "Welcome Campaign",
  "status": "draft",
  "channels": ["email", "sms"],
  "createdAt": "2026-02-12T10:00:00Z",
  "createdBy": "user-123"
}
```

#### 2. Get Campaign
```
GET /api/v1/campaigns/{campaignId}

Response (200 OK):
{
  "id": "camp-123",
  "tenantId": "tenant-123",
  "name": "Welcome Campaign",
  "status": "draft",
  "channels": ["email", "sms"],
  "targetAudience": {
    "segmentId": "seg-123"
  },
  "performance": {
    "sent": 0,
    "delivered": 0,
    "opened": 0,
    "clicked": 0
  },
  "createdAt": "2026-02-12T10:00:00Z",
  "updatedAt": "2026-02-12T10:00:00Z"
}
```

#### 3. List Campaigns
```
GET /api/v1/campaigns?status=active&limit=10&offset=0

Response (200 OK):
{
  "data": [
    {
      "id": "camp-123",
      "name": "Welcome Campaign",
      "status": "active",
      "channels": ["email", "sms"]
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

#### 4. Update Campaign
```
PATCH /api/v1/campaigns/{campaignId}
Content-Type: application/json

Request Body:
{
  "name": "Updated Campaign Name",
  "description": "Updated description"
}

Response (200 OK):
{
  "id": "camp-123",
  "name": "Updated Campaign Name",
  "description": "Updated description",
  "updatedAt": "2026-02-12T11:00:00Z"
}
```

#### 5. Delete Campaign
```
DELETE /api/v1/campaigns/{campaignId}

Response (204 No Content)
```

#### 6. Transition Campaign Status
```
POST /api/v1/campaigns/{campaignId}/status
Content-Type: application/json

Request Body:
{
  "status": "active"
}

Response (200 OK):
{
  "id": "camp-123",
  "status": "active",
  "updatedAt": "2026-02-12T11:00:00Z"
}
```

#### 7. Execute Campaign
```
POST /api/v1/campaigns/{campaignId}/execute
Content-Type: application/json

Request Body:
{
  "executedBy": "user-123"
}

Response (200 OK):
{
  "executionId": "exec-123",
  "campaignId": "camp-123",
  "status": "executing",
  "recipientCount": 1000,
  "startedAt": "2026-02-12T11:00:00Z"
}
```

#### 8. Get Campaign Performance
```
GET /api/v1/campaigns/{campaignId}/performance

Response (200 OK):
{
  "campaignId": "camp-123",
  "sent": 1000,
  "delivered": 950,
  "opened": 450,
  "clicked": 120,
  "converted": 45,
  "successRate": 95.0,
  "engagementRate": 47.4,
  "clickRate": 26.7
}
```

---

### Template Endpoints

#### 1. Create Template
```
POST /api/v1/templates
Content-Type: application/json

Request Body:
{
  "name": "Welcome Email",
  "channel": "email",
  "subject": "Welcome {{firstName}}!",
  "content": "Hello {{firstName}}, welcome to our platform!"
}

Response (201 Created):
{
  "id": "tpl-123",
  "name": "Welcome Email",
  "channel": "email",
  "variables": ["firstName"],
  "version": 1,
  "status": "draft",
  "createdAt": "2026-02-12T10:00:00Z"
}
```

#### 2. Get Template
```
GET /api/v1/templates/{templateId}

Response (200 OK):
{
  "id": "tpl-123",
  "name": "Welcome Email",
  "channel": "email",
  "subject": "Welcome {{firstName}}!",
  "content": "Hello {{firstName}}, welcome!",
  "variables": ["firstName"],
  "version": 1,
  "status": "active"
}
```

#### 3. List Templates
```
GET /api/v1/templates?channel=email&limit=10

Response (200 OK):
{
  "data": [
    {
      "id": "tpl-123",
      "name": "Welcome Email",
      "channel": "email",
      "version": 1,
      "status": "active"
    }
  ],
  "total": 25,
  "limit": 10
}
```

#### 4. Update Template
```
PATCH /api/v1/templates/{templateId}
Content-Type: application/json

Request Body:
{
  "content": "Updated content with {{firstName}}"
}

Response (200 OK):
{
  "id": "tpl-123",
  "name": "Welcome Email",
  "version": 2,
  "variables": ["firstName"],
  "updatedAt": "2026-02-12T11:00:00Z"
}
```

#### 5. Render Template
```
POST /api/v1/templates/{templateId}/render
Content-Type: application/json

Request Body:
{
  "variables": {
    "firstName": "John"
  }
}

Response (200 OK):
{
  "rendered": "Hello John, welcome!"
}
```

#### 6. Delete Template
```
DELETE /api/v1/templates/{templateId}

Response (204 No Content)
```

---

### Audience Segment Endpoints

#### 1. Create Segment
```
POST /api/v1/segments
Content-Type: application/json

Request Body:
{
  "name": "Active Users",
  "description": "Users active in last 30 days",
  "criteria": {
    "demographic": {
      "age": "18-65",
      "location": ["Lagos", "Abuja"]
    },
    "behavioral": {
      "lastLoginDays": "<30"
    }
  },
  "estimatedSize": 5000
}

Response (201 Created):
{
  "id": "seg-123",
  "name": "Active Users",
  "criteria": {...},
  "estimatedSize": 5000,
  "isDynamic": false,
  "createdAt": "2026-02-12T10:00:00Z"
}
```

#### 2. Get Segment
```
GET /api/v1/segments/{segmentId}

Response (200 OK):
{
  "id": "seg-123",
  "name": "Active Users",
  "criteria": {...},
  "estimatedSize": 5000,
  "isDynamic": false
}
```

#### 3. List Segments
```
GET /api/v1/segments?limit=10

Response (200 OK):
{
  "data": [
    {
      "id": "seg-123",
      "name": "Active Users",
      "estimatedSize": 5000
    }
  ],
  "total": 15,
  "limit": 10
}
```

#### 4. Update Segment
```
PATCH /api/v1/segments/{segmentId}
Content-Type: application/json

Request Body:
{
  "estimatedSize": 6000,
  "criteria": {
    "demographic": {
      "age": "25-55"
    }
  }
}

Response (200 OK):
{
  "id": "seg-123",
  "name": "Active Users",
  "estimatedSize": 6000,
  "updatedAt": "2026-02-12T11:00:00Z"
}
```

#### 5. Evaluate Segment
```
POST /api/v1/segments/{segmentId}/evaluate
Content-Type: application/json

Request Body:
{
  "contacts": [
    {
      "id": "contact-1",
      "age": "30",
      "location": "Lagos",
      "lastLoginDays": "5"
    },
    {
      "id": "contact-2",
      "age": "70",
      "location": "Lagos",
      "lastLoginDays": "5"
    }
  ]
}

Response (200 OK):
{
  "matched": [
    {
      "id": "contact-1",
      "age": "30",
      "location": "Lagos"
    }
  ],
  "matchCount": 1,
  "totalCount": 2,
  "matchPercentage": 50.0
}
```

#### 6. Delete Segment
```
DELETE /api/v1/segments/{segmentId}

Response (204 No Content)
```

---

### Execution Endpoints

#### 1. Create Execution
```
POST /api/v1/executions
Content-Type: application/json

Request Body:
{
  "campaignId": "camp-123",
  "recipientCount": 1000
}

Response (201 Created):
{
  "id": "exec-123",
  "campaignId": "camp-123",
  "status": "pending",
  "recipientCount": 1000,
  "sentCount": 0,
  "deliveredCount": 0,
  "createdAt": "2026-02-12T10:00:00Z"
}
```

#### 2. Get Execution
```
GET /api/v1/executions/{executionId}

Response (200 OK):
{
  "id": "exec-123",
  "campaignId": "camp-123",
  "status": "executing",
  "recipientCount": 1000,
  "sentCount": 500,
  "deliveredCount": 475,
  "failedCount": 25,
  "startedAt": "2026-02-12T10:00:00Z"
}
```

#### 3. List Executions
```
GET /api/v1/campaigns/{campaignId}/executions

Response (200 OK):
{
  "data": [
    {
      "id": "exec-123",
      "status": "completed",
      "recipientCount": 1000,
      "sentCount": 1000,
      "deliveredCount": 950
    }
  ],
  "total": 5
}
```

#### 4. Start Execution
```
POST /api/v1/executions/{executionId}/start

Response (200 OK):
{
  "id": "exec-123",
  "status": "executing",
  "startedAt": "2026-02-12T10:00:00Z"
}
```

#### 5. Complete Execution
```
POST /api/v1/executions/{executionId}/complete

Response (200 OK):
{
  "id": "exec-123",
  "status": "completed",
  "completedAt": "2026-02-12T11:00:00Z",
  "successRate": 95.0,
  "failureRate": 5.0
}
```

---

### Delivery Event Endpoints

#### 1. Record Delivery Event
```
POST /api/v1/delivery-events
Content-Type: application/json

Request Body:
{
  "campaignId": "camp-123",
  "executionId": "exec-123",
  "recipientId": "contact-123",
  "channel": "email",
  "messageId": "msg-123",
  "status": "delivered"
}

Response (201 Created):
{
  "id": "event-123",
  "campaignId": "camp-123",
  "status": "delivered",
  "timestamp": "2026-02-12T10:00:00Z"
}
```

#### 2. List Delivery Events
```
GET /api/v1/campaigns/{campaignId}/delivery-events

Response (200 OK):
{
  "data": [
    {
      "id": "event-123",
      "recipientId": "contact-123",
      "status": "delivered",
      "timestamp": "2026-02-12T10:00:00Z"
    }
  ],
  "total": 1000
}
```

#### 3. Get Campaign Metrics
```
GET /api/v1/campaigns/{campaignId}/metrics

Response (200 OK):
{
  "sent": 1000,
  "delivered": 950,
  "opened": 450,
  "clicked": 120,
  "failed": 50,
  "bounced": 10,
  "complained": 5,
  "unsubscribed": 15,
  "successRate": 95.0,
  "engagementRate": 47.4,
  "clickRate": 26.7
}
```

---

## Error Responses

### Error Response Format
```json
{
  "error": {
    "code": "CAMPAIGN_NOT_FOUND",
    "message": "Campaign not found",
    "details": {
      "campaignId": "camp-123"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| CAMPAIGN_NOT_FOUND | 404 | Campaign does not exist |
| TEMPLATE_NOT_FOUND | 404 | Template does not exist |
| SEGMENT_NOT_FOUND | 404 | Segment does not exist |
| EXECUTION_NOT_FOUND | 404 | Execution does not exist |
| INVALID_STATUS_TRANSITION | 400 | Invalid campaign status transition |
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | User not authorized |
| FORBIDDEN | 403 | User does not have permission |
| INTERNAL_ERROR | 500 | Internal server error |

---

## Authentication

All API endpoints require authentication via Bearer token:

```
Authorization: Bearer {token}
```

---

## Rate Limiting

- 1000 requests per minute per API key
- 100 requests per second per API key

---

## Pagination

List endpoints support pagination:

```
GET /api/v1/campaigns?limit=10&offset=20

Query Parameters:
- limit: Number of results to return (default: 10, max: 100)
- offset: Number of results to skip (default: 0)
```

---

## Filtering

List endpoints support filtering:

```
GET /api/v1/campaigns?status=active&channel=email

Query Parameters:
- status: Campaign status (draft, scheduled, active, paused, completed, archived)
- channel: Campaign channel (email, sms, push, in_app, social)
- createdAfter: ISO 8601 date
- createdBefore: ISO 8601 date
```

---

## Webhooks

Subscribe to campaign events via webhooks:

```
POST /api/v1/webhooks
Content-Type: application/json

Request Body:
{
  "url": "https://example.com/webhooks/campaigns",
  "events": [
    "campaign.created",
    "campaign.execution.completed",
    "campaign.delivery.sent"
  ]
}
```

---

**API Version:** 1.0.0  
**Last Updated:** 2026-02-12  
**Maintained By:** WebWaka Engineering Team
