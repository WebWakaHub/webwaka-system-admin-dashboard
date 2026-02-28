# Search & Discovery Engine - API Specification

**Date:** 2026-02-12  
**Module:** Search & Discovery Engine  
**Author:** webwakaagent3 (Specifications & Documentation)

---

## 1. Overview

This document provides a detailed specification for the Search & Discovery Engine's REST API. The API is designed to be simple, intuitive, and easy to use.

## 2. Authentication

All API endpoints will be protected by JWT-based authentication (to be implemented in Phase 2). The JWT must be passed in the `Authorization` header as a Bearer token.

## 3. API Endpoints

### `GET /search`

Search for content across the platform.

**Description:**
This endpoint allows you to search for content across all indexed data sources. It supports full-text search, filtering, faceting, and pagination.

**Request:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/search` | Search for content |

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | String | Yes | The search term. |
| `filter` | String | No | A filter expression (e.g., `contentType:blog`). |
| `facets` | String | No | Comma-separated list of fields to facet on. |
| `page` | Number | No | The page number for pagination (default: 1). |
| `limit` | Number | No | The number of results per page (default: 20). |

**Example Request:**

```http
GET /search?query=blog%20post&filter=contentType:blog&page=1&limit=10
Authorization: Bearer <JWT>
```

**Response (200 OK):**

```json
{
  "hits": [
    {
      "id": "doc-1",
      "tenantId": "tenant-1",
      "contentType": "blog",
      "title": "My First Blog Post",
      "content": "This is the content of my first blog post.",
      "author": "John Doe",
      "tags": ["blog", "first"],
      "createdAt": "2026-02-12T10:00:00.000Z"
    }
  ],
  "nbHits": 1,
  "page": 1,
  "limit": 10,
  "processingTimeMs": 25,
  "query": "blog post"
}
```

**Error Responses:**

- **400 Bad Request:** Invalid query parameters.
- **401 Unauthorized:** Missing or invalid JWT.
- **500 Internal Server Error:** An unexpected error occurred.

### `GET /search/suggestions`

Get search suggestions (autocomplete).

**Description:**
This endpoint provides search suggestions based on a partial query. It is designed for building autocomplete functionality.

**Request:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/search/suggestions` | Get search suggestions |

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | String | Yes | The partial search term. |
| `limit` | Number | No | The maximum number of suggestions to return (default: 5). |

**Example Request:**

```http
GET /search/suggestions?query=blog&limit=5
Authorization: Bearer <JWT>
```

**Response (200 OK):**

```json
[
  "Blog Post 1",
  "Blog Post 2",
  "My Awesome Blog"
]
```

**Error Responses:**

- **400 Bad Request:** Invalid query parameters.
- **401 Unauthorized:** Missing or invalid JWT.
- **500 Internal Server Error:** An unexpected error occurred.

## 4. Data Structures

### `SearchDocument`

| Field | Type | Description |
|---|---|---|
| `id` | String | Unique ID of the document |
| `tenantId` | String | The tenant the document belongs to |
| `contentType` | String | The content model name |
| `title` | String | The title of the content |
| `content` | String | The main body of the content |
| `author` | String | The author's name |
| `tags` | Array of Strings | Any tags associated with the content |
| `createdAt` | Timestamp | The creation date of the content |

### `SearchResult`

| Field | Type | Description |
|---|---|---|
| `hits` | Array of `SearchDocument` | The matching documents |
| `nbHits` | Number | The total number of hits |
| `page` | Number | The current page |
| `limit` | Number | The number of results per page |
| `processingTimeMs` | Number | The search processing time in milliseconds |
| `query` | String | The original search query |
| `facetDistribution` | Object | The distribution of facets (if requested) |

## 5. Events

### Emitted Events

- **`search.document.indexed`:** Emitted when a document is successfully indexed.
- **`search.document.removed`:** Emitted when a document is removed from the index.

### Subscribed Events

- **`content.published`:** Triggers indexing of new content.
- **`content.updated`:** Triggers re-indexing of updated content.
- **`content.unpublished`:** Triggers removal of content from the index.
