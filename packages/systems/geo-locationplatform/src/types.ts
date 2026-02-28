// LocationPlatformSystem — Type Definitions
// System ID: SYS-GEO-LOCATIONPLATFORM
// Content Hash: 0edd976f

export const SYSTEM_ID = 'SYS-GEO-LOCATIONPLATFORM';
export const SYSTEM_VERSION = 'v0.1.0';

// Nigeria-First Configuration
export const NIGERIA_FIRST_CONFIG = {
  defaultLocale: 'en-NG',
  defaultCurrency: 'NGN',
  defaultTimezone: 'Africa/Lagos',
  networkTimeout: 30000,
  offlineEnabled: true,
  syncRetryInterval: 5000,
};

// Offline Support Types
export interface OfflineQueueEntry {
  id: string;
  operation: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface NetworkConfig {
  timeout: number;
  retryAttempts: number;
  offlineFallback: boolean;
  syncOnReconnect: boolean;
}

// Organ Interfaces
export interface MapRendererOrgan {
  initialize(): Promise<void>;
  execute(command: MapRendererCommand): Promise<MapRendererResult>;
  executeOffline(command: MapRendererCommand): Promise<MapRendererResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface GeocoderOrgan {
  initialize(): Promise<void>;
  execute(command: GeocoderCommand): Promise<GeocoderResult>;
  executeOffline(command: GeocoderCommand): Promise<GeocoderResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface SpatialAnalyzerOrgan {
  initialize(): Promise<void>;
  execute(command: SpatialAnalyzerCommand): Promise<SpatialAnalyzerResult>;
  executeOffline(command: SpatialAnalyzerCommand): Promise<SpatialAnalyzerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface RoutePlannerOrgan {
  initialize(): Promise<void>;
  execute(command: RoutePlannerCommand): Promise<RoutePlannerResult>;
  executeOffline(command: RoutePlannerCommand): Promise<RoutePlannerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface GeofenceManagerOrgan {
  initialize(): Promise<void>;
  execute(command: GeofenceManagerCommand): Promise<GeofenceManagerResult>;
  executeOffline(command: GeofenceManagerCommand): Promise<GeofenceManagerResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface MapRendererCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface MapRendererResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface GeocoderCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface GeocoderResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface SpatialAnalyzerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface SpatialAnalyzerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface RoutePlannerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface RoutePlannerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface GeofenceManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface GeofenceManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OrganHealth {
  status: 'healthy' | 'degraded' | 'offline';
  lastSync: number;
  pendingOperations: number;
}

export interface SystemCapability {
  name: string;
  available: boolean;
  offlineSupport: boolean;
}
