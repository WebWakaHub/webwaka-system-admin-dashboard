/**
 * Shared Types for WebWaka Platform
 * This module defines common types used across the platform
 */

export interface TenantContext {
  tenantId: string;
  userId?: string;
  permissions?: string[];
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface EventPayload {
  eventType: string;
  timestamp: string;
  tenantId: string;
  data: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export interface CacheConfig {
  host: string;
  port: number;
  ttl?: number;
}

export interface EventBusConfig {
  servers: string[];
  subject?: string;
}
