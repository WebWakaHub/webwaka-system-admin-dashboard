# Member Management API Documentation

**Module:** Member Management (Church Suite Module 1)  
**Version:** 1.0.0  
**Date:** 2026-02-13  
**Author:** webwakaagent3 (Architecture & System Design)  
**Status:** Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Common Headers](#common-headers)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
8. [Data Models](#data-models)
9. [Event Schema](#event-schema)
10. [Code Examples](#code-examples)

---

## Overview

The Member Management API provides RESTful endpoints for managing church members, including registration, profile management, family relationships, and pastoral care notes. All endpoints follow REST best practices and return JSON responses.

**Key Features:**
- RESTful API design
- JWT-based authentication
- Multi-tenant architecture
- Event-driven architecture (CloudEvents)
- NDPR-compliant data protection
- Nigerian-First compliance (+234 phone format)

---

## Authentication

All API endpoints require JWT authentication via the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**JWT Payload:**
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "permissions": ["members:read", "members:create", "members:update", "members:delete"],
  "exp": 1707840000
}
```

**Required Permissions:**
- `members:read` - Read member data
- `members:create` - Create new members
- `members:update` - Update existing members
- `members:delete` - Delete members
- `members:export` - Export member data

---

## Base URL

**Production:** `https://api.webwaka.com/v1`  
**Staging:** `https://api-staging.webwaka.com/v1`  
**Development:** `http://localhost:3000/api/v1`

---

## Common Headers

All requests must include the following headers:

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | JWT token for authentication |
| `X-Tenant-Id` | Yes | Tenant UUID for multi-tenancy |
| `Content-Type` | Yes (for POST/PUT) | `application/json` |
| `Accept` | No | `application/json` (default) |

**Example:**
```http
GET /api/v1/members/123 HTTP/1.1
Host: api.webwaka.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 123e4567-e89b-12d3-a456-426614174000
Accept: application/json
```

---

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

**HTTP Status Codes:**

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource or optimistic locking conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

**Limit:** 100 requests per 15 minutes per tenant  
**Header:** `X-RateLimit-Remaining` indicates remaining requests

**Rate Limit Exceeded Response:**
```json
{
  "error": "Rate limit exceeded. Please try again in 15 minutes.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## API Endpoints

### 1. Create Member

**Endpoint:** `POST /api/v1/members`  
**Permission:** `members:create`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "maritalStatus": "married",
  "phone": "+2348012345678",
  "email": "john.doe@example.com",
  "address": "123 Main Street, Ikeja",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "status": "visitor",
  "membershipDate": "2026-02-13",
  "membershipType": "regular",
  "tags": ["choir", "youth_ministry"],
  "photoUrl": "https://cdn.webwaka.com/photos/john-doe.jpg",
  "metadata": {
    "occupation": "Software Engineer",
    "referredBy": "Jane Smith"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "maritalStatus": "married",
  "phone": "+2348012345678",
  "email": "john.doe@example.com",
  "address": "123 Main Street, Ikeja",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "status": "visitor",
  "membershipDate": "2026-02-13",
  "membershipType": "regular",
  "tags": ["choir", "youth_ministry"],
  "photoUrl": "https://cdn.webwaka.com/photos/john-doe.jpg",
  "metadata": {
    "occupation": "Software Engineer",
    "referredBy": "Jane Smith"
  },
  "version": 1,
  "createdAt": "2026-02-13T14:30:00Z",
  "updatedAt": "2026-02-13T14:30:00Z",
  "createdBy": "123e4567-e89b-12d3-a456-426614174001",
  "updatedBy": "123e4567-e89b-12d3-a456-426614174001"
}
```

**Errors:**
- `400` - Invalid phone format, invalid email, missing required fields
- `409` - Duplicate phone number or email

---

### 2. Get Member by ID

**Endpoint:** `GET /api/v1/members/:id`  
**Permission:** `members:read`

**Path Parameters:**
- `id` (UUID) - Member ID

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

**Errors:**
- `404` - Member not found

---

### 3. Update Member

**Endpoint:** `PUT /api/v1/members/:id`  
**Permission:** `members:update`

**Path Parameters:**
- `id` (UUID) - Member ID

**Request Body:**
```json
{
  "firstName": "Jane",
  "email": "jane.doe@example.com",
  "version": 1
}
```

**Note:** `version` field is required for optimistic locking.

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "firstName": "Jane",
  "email": "jane.doe@example.com",
  "version": 2,
  ...
}
```

**Errors:**
- `404` - Member not found
- `409` - Optimistic locking conflict (version mismatch) or duplicate phone/email

---

### 4. Delete Member

**Endpoint:** `DELETE /api/v1/members/:id`  
**Permission:** `members:delete`

**Path Parameters:**
- `id` (UUID) - Member ID

**Response:** `204 No Content`

**Errors:**
- `404` - Member not found

**Note:** This is a soft delete. Member data is retained for audit purposes.

---

### 5. Search Members

**Endpoint:** `GET /api/v1/members/search`  
**Permission:** `members:read`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Search query (name, phone, email) |
| `status` | string | No | Filter by status (visitor, member, inactive, etc.) |
| `tags` | string | No | Comma-separated tags (e.g., "choir,youth") |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Results per page (default: 20, max: 100) |

**Example Request:**
```
GET /api/v1/members/search?query=John&status=member&tags=choir&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "members": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "firstName": "John",
      "lastName": "Doe",
      ...
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### 6. Change Member Status

**Endpoint:** `POST /api/v1/members/:id/status`  
**Permission:** `members:update`

**Path Parameters:**
- `id` (UUID) - Member ID

**Request Body:**
```json
{
  "status": "member",
  "version": 1
}
```

**Valid Status Values:**
- `visitor` - First-time visitor
- `member` - Active member
- `inactive` - Inactive member
- `transferred` - Transferred to another church
- `deceased` - Deceased member

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "status": "member",
  "version": 2,
  ...
}
```

**Errors:**
- `404` - Member not found
- `409` - Optimistic locking conflict

---

### 7. Export Members

**Endpoint:** `GET /api/v1/members/export`  
**Permission:** `members:export`

**Response:** `200 OK` (CSV file)
```csv
ID,First Name,Last Name,Phone,Email,Status,Membership Date
123e4567-e89b-12d3-a456-426614174002,John,Doe,+2348012345678,john.doe@example.com,member,2026-02-13
```

**Headers:**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename=members.csv`

---

### 8. Get Member Statistics

**Endpoint:** `GET /api/v1/members/statistics`  
**Permission:** `members:read`

**Response:** `200 OK`
```json
{
  "total": 500,
  "visitors": 150,
  "members": 300,
  "inactive": 50
}
```

---

## Data Models

### Member

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique member ID |
| `tenantId` | UUID | Yes | Tenant ID |
| `firstName` | string | Yes | First name (max 100 chars) |
| `lastName` | string | Yes | Last name (max 100 chars) |
| `middleName` | string | No | Middle name (max 100 chars) |
| `dateOfBirth` | date | No | Date of birth (ISO 8601) |
| `gender` | enum | No | `male`, `female`, `other` |
| `maritalStatus` | enum | No | `single`, `married`, `divorced`, `widowed` |
| `phone` | string | Yes | Phone number (+234XXXXXXXXXX) |
| `email` | string | No | Email address |
| `address` | string | No | Physical address |
| `city` | string | No | City (max 100 chars) |
| `state` | string | No | State (max 100 chars) |
| `country` | string | No | Country (max 20 chars) |
| `status` | enum | Yes | `visitor`, `member`, `inactive`, `transferred`, `deceased` |
| `membershipDate` | date | No | Date became member |
| `membershipType` | string | No | Type of membership (max 50 chars) |
| `tags` | array | No | Tags (max 20 tags, max 50 chars each) |
| `photoUrl` | string | No | Photo URL |
| `metadata` | object | No | Additional metadata (JSONB) |
| `version` | integer | Yes | Version for optimistic locking |
| `createdAt` | timestamp | Yes | Creation timestamp |
| `updatedAt` | timestamp | Yes | Last update timestamp |
| `createdBy` | UUID | Yes | User who created the member |
| `updatedBy` | UUID | Yes | User who last updated the member |

---

## Event Schema

All events follow the CloudEvents 1.0 specification and are published to RabbitMQ/NATS.

### member.created

```json
{
  "specversion": "1.0",
  "type": "com.webwaka.member.created",
  "source": "/member-management",
  "id": "123e4567-e89b-12d3-a456-426614174002-created-1707840000",
  "time": "2026-02-13T14:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "memberId": "123e4567-e89b-12d3-a456-426614174002",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "email": "john.doe@example.com",
    "status": "visitor",
    "createdAt": "2026-02-13T14:30:00Z"
  }
}
```

### member.updated

Similar structure to `member.created`.

### member.deleted

```json
{
  "data": {
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "memberId": "123e4567-e89b-12d3-a456-426614174002",
    "deletedAt": "2026-02-13T14:30:00Z"
  }
}
```

### member.status.changed

```json
{
  "data": {
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "memberId": "123e4567-e89b-12d3-a456-426614174002",
    "oldStatus": "visitor",
    "newStatus": "member",
    "changedAt": "2026-02-13T14:30:00Z"
  }
}
```

---

## Code Examples

### JavaScript/TypeScript (Node.js)

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.webwaka.com/v1';
const JWT_TOKEN = 'your-jwt-token';
const TENANT_ID = '123e4567-e89b-12d3-a456-426614174000';

// Create member
async function createMember() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/members`,
      {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678',
        email: 'john.doe@example.com',
        status: 'visitor',
      },
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'X-Tenant-Id': TENANT_ID,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Member created:', response.data);
  } catch (error) {
    console.error('Error creating member:', error.response.data);
  }
}

// Get member by ID
async function getMember(memberId: string) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/members/${memberId}`,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'X-Tenant-Id': TENANT_ID,
        },
      }
    );
    console.log('Member:', response.data);
  } catch (error) {
    console.error('Error fetching member:', error.response.data);
  }
}

// Search members
async function searchMembers(query: string) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/members/search`,
      {
        params: { query, status: 'member', page: 1, limit: 20 },
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'X-Tenant-Id': TENANT_ID,
        },
      }
    );
    console.log('Search results:', response.data);
  } catch (error) {
    console.error('Error searching members:', error.response.data);
  }
}
```

### Python

```python
import requests

API_BASE_URL = 'https://api.webwaka.com/v1'
JWT_TOKEN = 'your-jwt-token'
TENANT_ID = '123e4567-e89b-12d3-a456-426614174000'

headers = {
    'Authorization': f'Bearer {JWT_TOKEN}',
    'X-Tenant-Id': TENANT_ID,
    'Content-Type': 'application/json',
}

# Create member
def create_member():
    data = {
        'firstName': 'John',
        'lastName': 'Doe',
        'phone': '+2348012345678',
        'email': 'john.doe@example.com',
        'status': 'visitor',
    }
    response = requests.post(f'{API_BASE_URL}/members', json=data, headers=headers)
    if response.status_code == 201:
        print('Member created:', response.json())
    else:
        print('Error:', response.json())

# Get member by ID
def get_member(member_id):
    response = requests.get(f'{API_BASE_URL}/members/{member_id}', headers=headers)
    if response.status_code == 200:
        print('Member:', response.json())
    else:
        print('Error:', response.json())

# Search members
def search_members(query):
    params = {'query': query, 'status': 'member', 'page': 1, 'limit': 20}
    response = requests.get(f'{API_BASE_URL}/members/search', params=params, headers=headers)
    if response.status_code == 200:
        print('Search results:', response.json())
    else:
        print('Error:', response.json())
```

### cURL

```bash
# Create member
curl -X POST https://api.webwaka.com/v1/members \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-Id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "email": "john.doe@example.com",
    "status": "visitor"
  }'

# Get member by ID
curl -X GET https://api.webwaka.com/v1/members/123e4567-e89b-12d3-a456-426614174002 \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-Id: 123e4567-e89b-12d3-a456-426614174000"

# Search members
curl -X GET "https://api.webwaka.com/v1/members/search?query=John&status=member&page=1&limit=20" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-Id: 123e4567-e89b-12d3-a456-426614174000"
```

---

**Document Status:** Complete  
**Created By:** webwakaagent3 (Architecture & System Design)  
**Date:** 2026-02-13  
**Last Updated:** 2026-02-13
