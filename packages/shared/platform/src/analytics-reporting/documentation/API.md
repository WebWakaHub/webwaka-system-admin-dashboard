# Analytics & Reporting - API Specification

**Date:** 2026-02-12  
**Module:** Analytics & Reporting  
**Author:** webwakaagent3 (Specifications & Documentation)

---

## 1. Overview

This document provides a detailed specification for the Analytics & Reporting module's REST API. The API is designed to be simple, intuitive, and easy to use.

## 2. Authentication

All API endpoints will be protected by JWT-based authentication (to be implemented in Phase 2). The JWT must be passed in the `Authorization` header as a Bearer token.

## 3. API Endpoints

### `GET /analytics/summary`

Get a summary of key analytics metrics.

**Query Parameters:**
- `startDate` (string, required): Start date (YYYY-MM-DD).
- `endDate` (string, required): End date (YYYY-MM-DD).

**Response (200 OK):**
```json
{
  "totalUsers": 1250,
  "pageViews": 15000,
  "bounceRate": 0.45,
  "avgSessionDuration": 180
}
```

### `GET /analytics/top-pages`

Get the top pages by page views.

**Query Parameters:**
- `startDate` (string, required): Start date (YYYY-MM-DD).
- `endDate` (string, required): End date (YYYY-MM-DD).
- `limit` (number, optional): The number of results to return (default: 10).

**Response (200 OK):**
```json
[
  { "page": "/home", "views": 5000, "uniqueVisitors": 2500 },
  { "page": "/about", "views": 3000, "uniqueVisitors": 1800 },
  { "page": "/contact", "views": 2000, "uniqueVisitors": 1200 }
]
```

### `GET /analytics/top-referrers`

Get the top referrers by visits.

**Query Parameters:**
- `startDate` (string, required): Start date (YYYY-MM-DD).
- `endDate` (string, required): End date (YYYY-MM-DD).
- `limit` (number, optional): The number of results to return (default: 10).

**Response (200 OK):**
```json
[
  { "referrer": "https://google.com", "visits": 3000 },
  { "referrer": "https://facebook.com", "visits": 2000 },
  { "referrer": "https://twitter.com", "visits": 1500 }
]
```

### `GET /analytics/page-views-over-time`

Get page views over time.

**Query Parameters:**
- `startDate` (string, required): Start date (YYYY-MM-DD).
- `endDate` (string, required): End date (YYYY-MM-DD).

**Response (200 OK):**
```json
[
  { "date": "2026-02-01", "views": 1000 },
  { "date": "2026-02-02", "views": 1200 },
  { "date": "2026-02-03", "views": 1100 }
]
```

## 4. Data Structures

### `AnalyticsSummary`

| Field | Type | Description |
|---|---|---|
| `totalUsers` | Number | Total number of unique users |
| `pageViews` | Number | Total number of page views |
| `bounceRate` | Number | Bounce rate (percentage) |
| `avgSessionDuration` | Number | Average session duration (seconds) |

### `TopPagesData`

| Field | Type | Description |
|---|---|---|
| `page` | String | Page URL |
| `views` | Number | Number of views |
| `uniqueVisitors` | Number | Unique visitors |

### `ReferrerData`

| Field | Type | Description |
|---|---|---|
| `referrer` | String | Referrer URL |
| `visits` | Number | Number of visits from this referrer |

## 5. Events

### Subscribed Events

- `analytics.pageView`
- `analytics.click`
- `analytics.formSubmission`

### Emitted Events

- `analytics.event.processed`
