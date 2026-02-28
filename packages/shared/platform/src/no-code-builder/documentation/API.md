# No-Code/Low-Code Builder - API Documentation

**Date:** 2026-02-12  
**Module:** No-Code/Low-Code Builder  
**Author:** webwakaagent3 (Architecture)

---

## 1. Introduction

This document provides a comprehensive reference for the No-Code/Low-Code Builder REST API. The API allows for programmatic management of applications and deployments.

**Base URL:** `/api/v1/builder`

**Authentication:** All endpoints require a valid JWT token for an authenticated user.

---

## 2. Application Management

### 2.1 Create Application

- **Endpoint:** `POST /apps`
- **Description:** Creates a new application with a default page.
- **Permissions:** `builder.app.create`

**Request Body:**

```json
{
  "name": "My New Application",
  "description": "An optional description for the application"
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "app-12345",
    "tenantId": "tenant-67890",
    "createdBy": "user-abcde",
    "name": "My New Application",
    "description": "An optional description for the application",
    "pages": [
      {
        "id": "page-1",
        "name": "Home",
        "path": "/",
        "components": []
      }
    ],
    "globalStyles": {},
    "deploymentStatus": "draft",
    "publicUrl": null,
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T10:00:00Z"
  }
}
```

### 2.2 List Applications

- **Endpoint:** `GET /apps`
- **Description:** Retrieves a list of all applications for the current tenant.
- **Permissions:** `builder.app.read` (implied)

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "app-12345",
      "name": "My New Application",
      "deploymentStatus": "draft",
      "createdAt": "2026-02-12T10:00:00Z",
      "updatedAt": "2026-02-12T10:00:00Z"
    },
    {
      "id": "app-67890",
      "name": "Another Application",
      "deploymentStatus": "live",
      "publicUrl": "https://app-67890.example.com",
      "createdAt": "2026-02-11T15:30:00Z",
      "updatedAt": "2026-02-11T16:00:00Z"
    }
  ]
}
```

### 2.3 Get Application

- **Endpoint:** `GET /apps/:appId`
- **Description:** Retrieves a single application by its ID.
- **Permissions:** `builder.app.read` (implied)

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "app-12345",
    "name": "My New Application",
    // ... full application definition
  }
}
```

### 2.4 Update Application

- **Endpoint:** `PUT /apps/:appId`
- **Description:** Updates the definition of an application (name, pages, styles, etc.).
- **Permissions:** `builder.app.update`

**Request Body:**

```json
{
  "name": "Updated Application Name",
  "pages": [
    {
      "id": "page-1",
      "name": "Home",
      "path": "/",
      "components": [
        {
          "id": "text-1",
          "type": "text",
          "properties": {
            "content": "Welcome to the updated app!"
          }
        }
      ]
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "app-12345",
    "name": "Updated Application Name",
    // ... updated application definition
  }
}
```

### 2.5 Delete Application

- **Endpoint:** `DELETE /apps/:appId`
- **Description:** Deletes an application permanently.
- **Permissions:** `builder.app.delete`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Application deleted successfully"
}
```

---

## 3. Deployment Management

### 3.1 Deploy Application

- **Endpoint:** `POST /apps/:appId/deploy`
- **Description:** Triggers the deployment process for an application.
- **Permissions:** `builder.app.deploy`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "publicUrl": "https://app-12345.example.com"
  }
}
```

### 3.2 Undeploy Application

- **Endpoint:** `POST /apps/:appId/undeploy`
- **Description:** Takes a deployed application offline.
- **Permissions:** `builder.app.deploy`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Application undeployed successfully"
}
```

---

## 4. Error Responses

All API endpoints return a consistent error response format.

**Example (404 Not Found):**

```json
{
  "status": "error",
  "error": {
    "code": "ApplicationNotFoundError",
    "message": "Application not found: app-does-not-exist"
  }
}
```

**Common Error Codes:**

| Code | Description |
|---|---|
| 400 Bad Request | Invalid request body or parameters |
| 401 Unauthorized | Missing or invalid authentication token |
| 403 Forbidden | User does not have the required permissions |
| 404 Not Found | The requested resource does not exist |
| 500 Internal Server Error | An unexpected server error occurred |

---

**Document Status:** ✅ **COMPLETE**
