'''# Headless CMS API Documentation

**Module:** Headless CMS  
**Version:** 1.0  
**Date:** 2026-02-12  
**Author:** webwakaagent3 (Architecture)

---

## 1. Overview

This document provides detailed documentation for the Headless CMS API. The API is divided into two main parts:

1.  **Content Management API:** A protected API for managing content models and entries.
2.  **Content Delivery API:** A public, read-only API for delivering published content.

## 2. Content Management API

All endpoints in the Content Management API are protected and require authentication and authorization.

### 2.1 Content Models

#### Create a Content Model

- **Endpoint:** `POST /api/v1/cms/models`
- **Description:** Creates a new content model.
- **Permissions:** `content.model.create`
- **Request Body:**

```json
{
  "name": "blog_post",
  "pluralName": "blog_posts",
  "description": "Blog post content type",
  "fields": [
    {
      "id": "title",
      "name": "title",
      "type": "text",
      "required": true
    },
    {
      "id": "body",
      "name": "body",
      "type": "rich_text",
      "required": true
    }
  ]
}
```

- **Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "model-123",
    "tenantId": "tenant-456",
    "name": "blog_post",
    "pluralName": "blog_posts",
    "description": "Blog post content type",
    "fields": [...],
    "createdAt": "2026-02-12T10:00:00.000Z",
    "updatedAt": "2026-02-12T10:00:00.000Z",
    "createdBy": "user-789",
    "updatedBy": "user-789"
  }
}
```

#### List all Content Models

- **Endpoint:** `GET /api/v1/cms/models`
- **Description:** Retrieves a list of all content models for the tenant.
- **Permissions:** `content.model.read`
- **Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "model-123",
      "name": "blog_post",
      ...
    },
    {
      "id": "model-456",
      "name": "product",
      ...
    }
  ]
}
```

### 2.2 Content Entries

#### Create a Content Entry

- **Endpoint:** `POST /api/v1/cms/models/:modelId/entries`
- **Description:** Creates a new content entry for a given model.
- **Permissions:** `content.entry.create`
- **Request Body:**

```json
{
  "data": {
    "title": "My First Blog Post",
    "body": "<p>This is the content.</p>"
  },
  "status": "draft"
}
```

- **Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "entry-123",
    "tenantId": "tenant-456",
    "modelId": "model-123",
    "data": {
      "title": "My First Blog Post",
      "body": "<p>This is the content.</p>"
    },
    "status": "draft",
    "version": 1,
    ...
  }
}
```

## 3. Content Delivery API

All endpoints in the Content Delivery API are public and read-only.

### 3.1 Get Content by Model

- **Endpoint:** `GET /api/v1/content/:modelPluralName`
- **Description:** Retrieves a list of published content entries for a given model.
- **Query Parameters:**
    - `limit` (number, optional): The number of entries to return.
    - `offset` (number, optional): The number of entries to skip.
    - `sort` (string, optional): A JSON string for sorting, e.g., `[{"field":"createdAt","order":"desc"}]`.
    - `filters` (string, optional): A JSON string for filtering, e.g., `{"category":"tech"}`.
- **Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "entry-123",
      "data": {
        "title": "My First Blog Post",
        ...
      },
      ...
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 3.2 Search Content

- **Endpoint:** `GET /api/v1/content/search`
- **Description:** Searches for published content across all models.
- **Query Parameters:**
    - `q` (string, required): The search term.
- **Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "entry-123",
      "data": {
        "title": "My First Blog Post",
        ...
      },
      ...
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```
'''
