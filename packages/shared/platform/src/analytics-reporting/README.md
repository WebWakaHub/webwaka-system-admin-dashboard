# Analytics & Reporting Module

The Analytics & Reporting module provides comprehensive tracking, analysis, and visualization of user behavior and application performance across the WebWaka platform.

## Features

- **Event Tracking:** Track page views, clicks, and form submissions
- **Real-Time Analytics:** Process and display analytics data in real-time
- **Multi-Tenant:** Complete data isolation between tenants
- **High Performance:** Built on ClickHouse for fast queries
- **Scalable:** Handles 10,000+ events per second

## Architecture

The module consists of two main services:

1. **EventProcessor:** Ingests events from the Event Bus and writes them to ClickHouse
2. **QueryService:** Provides APIs for querying analytics data

## Usage

```typescript
import { AnalyticsReporting } from './analytics-reporting';

// Initialize the module
const analytics = new AnalyticsReporting({
  database: db,
  eventBus: eventBus,
  clickHouseHost: 'localhost',
  clickHousePort: 8123,
  clickHouseDatabase: 'analytics',
  clickHouseUsername: 'default',
  clickHousePassword: '',
});

await analytics.initialize();

// Get analytics summary
const summary = await analytics.getSummary('tenant-1', {
  startDate: '2026-02-01',
  endDate: '2026-02-12',
});

console.log(summary);
// { totalUsers: 1250, pageViews: 15000, bounceRate: 0.45, avgSessionDuration: 180 }

// Get top pages
const topPages = await analytics.getTopPages('tenant-1', {
  startDate: '2026-02-01',
  endDate: '2026-02-12',
  limit: 10,
});

// Get top referrers
const topReferrers = await analytics.getTopReferrers('tenant-1', {
  startDate: '2026-02-01',
  endDate: '2026-02-12',
  limit: 10,
});
```

## Events

### Subscribed Events

- `analytics.pageView` - Triggered when a user views a page
- `analytics.click` - Triggered when a user clicks an element
- `analytics.formSubmission` - Triggered when a user submits a form

### Emitted Events

- `analytics.event.processed` - Emitted when an event is successfully processed

## Database Schema

```sql
CREATE TABLE events (
  timestamp DateTime,
  tenantId String,
  eventType String,
  userId String,
  sessionId String,
  page String,
  elementId Nullable(String),
  referrer Nullable(String),
  userAgent Nullable(String),
  ipAddress Nullable(String),
  metadata String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenantId, timestamp);
```

## API Endpoints

- `GET /analytics/summary` - Get analytics summary
- `GET /analytics/top-pages` - Get top pages
- `GET /analytics/top-referrers` - Get top referrers
- `GET /analytics/page-views-over-time` - Get page views over time

## Testing

Run tests with:

```bash
npm test src/analytics-reporting
```

## Documentation

- [Architecture](./documentation/ARCHITECTURE.md)
- [API Specification](./documentation/API.md)
