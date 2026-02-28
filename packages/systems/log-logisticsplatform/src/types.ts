// LogisticsPlatformSystem — Type Definitions
// System ID: SYS-LOG-LOGISTICSPLATFORM
// Content Hash: d42bdf91

export const SYSTEM_ID = 'SYS-LOG-LOGISTICSPLATFORM';
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
export interface InventoryManagerOrgan {
  initialize(): Promise<void>;
  execute(command: InventoryManagerCommand): Promise<InventoryManagerResult>;
  executeOffline(command: InventoryManagerCommand): Promise<InventoryManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ShipmentTrackerOrgan {
  initialize(): Promise<void>;
  execute(command: ShipmentTrackerCommand): Promise<ShipmentTrackerResult>;
  executeOffline(command: ShipmentTrackerCommand): Promise<ShipmentTrackerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface WarehouseControllerOrgan {
  initialize(): Promise<void>;
  execute(command: WarehouseControllerCommand): Promise<WarehouseControllerResult>;
  executeOffline(command: WarehouseControllerCommand): Promise<WarehouseControllerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface DeliveryOptimizerOrgan {
  initialize(): Promise<void>;
  execute(command: DeliveryOptimizerCommand): Promise<DeliveryOptimizerResult>;
  executeOffline(command: DeliveryOptimizerCommand): Promise<DeliveryOptimizerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface SupplyChainPlannerOrgan {
  initialize(): Promise<void>;
  execute(command: SupplyChainPlannerCommand): Promise<SupplyChainPlannerResult>;
  executeOffline(command: SupplyChainPlannerCommand): Promise<SupplyChainPlannerResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface InventoryManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface InventoryManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ShipmentTrackerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ShipmentTrackerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface WarehouseControllerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface WarehouseControllerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface DeliveryOptimizerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface DeliveryOptimizerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface SupplyChainPlannerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface SupplyChainPlannerResult {
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
