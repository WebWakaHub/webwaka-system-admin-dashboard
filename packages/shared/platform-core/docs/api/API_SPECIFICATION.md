# API Specification

**Document Type:** API Specification  
**Owner:** webwakaagent4 (Engineering & Delivery)  
**Status:** DRAFT  
**Version:** 0.1.0  
**Last Updated:** 2026-02-07  
**Phase:** Phase 2 - Milestone 2 - Week 3

---

## Overview

This document defines the API specification for the WebWaka Platform Core. The platform provides both REST and GraphQL APIs for maximum flexibility and developer experience.

## API Design Principles

1. **RESTful Design** - Follow REST principles for resource-based operations
2. **GraphQL for Complex Queries** - Use GraphQL for complex data fetching
3. **Versioning** - All APIs are versioned (v1, v2, etc.)
4. **Multi-Tenant** - All requests are tenant-scoped
5. **Authentication Required** - All APIs require authentication
6. **Rate Limited** - APIs are rate-limited to prevent abuse
7. **Offline-First** - APIs support offline queue and sync

---

## Base URLs

- **REST API:** `https://api.webwaka.com/v1`
- **GraphQL API:** `https://api.webwaka.com/graphql`
- **Development:** `http://localhost:3000/api/v1`

---

## Authentication

All API requests require authentication using JWT tokens.

### Authentication Flow

1. **Login** - POST `/auth/login` with credentials
2. **Receive Token** - Get JWT access token and refresh token
3. **Use Token** - Include token in Authorization header
4. **Refresh Token** - POST `/auth/refresh` when token expires

### Headers

```http
Authorization: Bearer <jwt_token>
X-Tenant-ID: <tenant_id>
Content-Type: application/json
```

---

## REST API Endpoints

### Authentication Endpoints

#### POST /auth/login

Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenant_slug": "acme-corp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 604800,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

#### POST /auth/refresh

Refresh expired access token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 604800
  }
}
```

#### POST /auth/logout

Logout user and invalidate tokens.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Management Endpoints

#### GET /users

List all users for the current tenant.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `search` (string, optional)
- `status` (string, optional: active, inactive, suspended)
- `role` (string, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "role": "staff",
        "created_at": "2026-02-07T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### GET /users/:id

Get a specific user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+234 800 000 0000",
    "status": "active",
    "role": "staff",
    "permissions": ["users.read", "users.write"],
    "created_at": "2026-02-07T10:00:00Z",
    "updated_at": "2026-02-07T10:00:00Z"
  }
}
```

#### POST /users

Create a new user.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+234 800 000 0001",
  "role_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "status": "active",
    "created_at": "2026-02-07T10:00:00Z"
  }
}
```

#### PUT /users/:id

Update an existing user.

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "+234 800 000 0002",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "+234 800 000 0002",
    "status": "active",
    "updated_at": "2026-02-07T11:00:00Z"
  }
}
```

#### DELETE /users/:id

Delete a user (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Role Management Endpoints

#### GET /roles

List all roles for the current tenant.

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "uuid",
        "name": "Administrator",
        "slug": "admin",
        "actor_type": "staff",
        "capabilities": ["users.read", "users.write", "roles.read"],
        "created_at": "2026-02-07T10:00:00Z"
      }
    ]
  }
}
```

#### POST /roles

Create a new role.

**Request:**
```json
{
  "name": "Manager",
  "slug": "manager",
  "description": "Manager role with limited permissions",
  "actor_type": "staff",
  "capability_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Manager",
    "slug": "manager",
    "actor_type": "staff",
    "created_at": "2026-02-07T10:00:00Z"
  }
}
```

---

### Event Endpoints

#### GET /events

List events for the current tenant.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `event_type` (string, optional)
- `aggregate_type` (string, optional)
- `aggregate_id` (uuid, optional)
- `from_date` (datetime, optional)
- `to_date` (datetime, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "event_type": "user.created",
        "event_version": "1.0",
        "aggregate_id": "uuid",
        "aggregate_type": "user",
        "payload": {
          "user_id": "uuid",
          "email": "user@example.com"
        },
        "published_at": "2026-02-07T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25
    }
  }
}
```

#### POST /events

Publish a new event.

**Request:**
```json
{
  "event_type": "custom.event",
  "event_version": "1.0",
  "aggregate_id": "uuid",
  "aggregate_type": "custom",
  "payload": {
    "key": "value"
  },
  "metadata": {
    "source": "mobile_app"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "event_type": "custom.event",
    "published_at": "2026-02-07T10:00:00Z"
  }
}
```

---

### Sync Endpoints

#### POST /sync/push

Push offline changes to server.

**Request:**
```json
{
  "operations": [
    {
      "operation_type": "create",
      "resource_type": "user",
      "resource_id": "uuid",
      "payload": {
        "email": "user@example.com",
        "first_name": "John"
      },
      "timestamp": "2026-02-07T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 10,
    "failed": 0,
    "conflicts": []
  }
}
```

#### POST /sync/pull

Pull changes from server.

**Request:**
```json
{
  "last_sync_at": "2026-02-07T09:00:00Z",
  "resource_types": ["user", "role"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "changes": [
      {
        "operation_type": "update",
        "resource_type": "user",
        "resource_id": "uuid",
        "payload": {
          "first_name": "Jane"
        },
        "timestamp": "2026-02-07T10:00:00Z"
      }
    ],
    "sync_token": "uuid"
  }
}
```

---

## GraphQL API

### Schema

```graphql
type Query {
  me: User!
  users(page: Int, limit: Int, search: String): UserConnection!
  user(id: ID!): User
  roles: [Role!]!
  role(id: ID!): Role
  events(page: Int, limit: Int, eventType: String): EventConnection!
}

type Mutation {
  login(email: String!, password: String!, tenantSlug: String!): AuthPayload!
  logout: Boolean!
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createRole(input: CreateRoleInput!): Role!
  publishEvent(input: PublishEventInput!): Event!
}

type User {
  id: ID!
  email: String!
  firstName: String
  lastName: String
  phone: String
  status: String!
  role: Role!
  permissions: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Role {
  id: ID!
  name: String!
  slug: String!
  actorType: String!
  capabilities: [Capability!]!
  createdAt: DateTime!
}

type Capability {
  id: ID!
  name: String!
  slug: String!
  description: String
  category: String
}

type Event {
  id: ID!
  eventType: String!
  eventVersion: String!
  aggregateId: ID
  aggregateType: String
  payload: JSON!
  publishedAt: DateTime!
}
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes

- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Authenticated:** 1000 requests per 15 minutes per user
- **Headers:**
  - `X-RateLimit-Limit` - Request limit
  - `X-RateLimit-Remaining` - Remaining requests
  - `X-RateLimit-Reset` - Reset timestamp

---

## Next Steps

1. Implement REST API endpoints
2. Implement GraphQL schema and resolvers
3. Add API authentication middleware
4. Add API rate limiting
5. Add API documentation (Swagger/OpenAPI)
6. Add API tests

---

**Status:** Week 3 Deliverable - API Specification ✅ COMPLETE
