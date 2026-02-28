/**
 * Type definitions for the Analytics & Reporting module
 */

/**
 * Configuration for the Analytics & Reporting module
 */
export interface AnalyticsReportingConfig {
  /** Database connection */
  database: any;
  /** Event bus for receiving events */
  eventBus: any;
  /** ClickHouse host URL */
  clickHouseHost: string;
  /** ClickHouse port */
  clickHousePort: number;
  /** ClickHouse database name */
  clickHouseDatabase: string;
  /** ClickHouse username */
  clickHouseUsername: string;
  /** ClickHouse password */
  clickHousePassword: string;
}

/**
 * Represents an analytics event
 */
export interface AnalyticsEvent {
  /** Timestamp of the event */
  timestamp: Date;
  /** Tenant ID */
  tenantId: string;
  /** Event type (e.g., 'pageView', 'click', 'formSubmission') */
  eventType: string;
  /** User ID */
  userId: string;
  /** Session ID */
  sessionId: string;
  /** Page URL */
  page: string;
  /** Element ID (for click events) */
  elementId?: string;
  /** Referrer URL */
  referrer?: string;
  /** User agent */
  userAgent?: string;
  /** IP address */
  ipAddress?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Analytics summary data
 */
export interface AnalyticsSummary {
  /** Total number of unique users */
  totalUsers: number;
  /** Total number of page views */
  pageViews: number;
  /** Bounce rate (percentage) */
  bounceRate: number;
  /** Average session duration (seconds) */
  avgSessionDuration: number;
}

/**
 * Top pages data
 */
export interface TopPagesData {
  /** Page URL */
  page: string;
  /** Number of views */
  views: number;
  /** Unique visitors */
  uniqueVisitors: number;
}

/**
 * Referrer data
 */
export interface ReferrerData {
  /** Referrer URL */
  referrer: string;
  /** Number of visits from this referrer */
  visits: number;
}

/**
 * Query parameters for analytics data
 */
export interface AnalyticsQuery {
  /** Start date (YYYY-MM-DD) */
  startDate: string;
  /** End date (YYYY-MM-DD) */
  endDate: string;
  /** Limit for results */
  limit?: number;
}
