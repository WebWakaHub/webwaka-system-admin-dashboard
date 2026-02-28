// EcommerceSystem — Type Definitions
// System ID: SYS-COM-ECOMMERCE
// Content Hash: c21a3396

export const SYSTEM_ID = 'SYS-COM-ECOMMERCE';
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
export interface ProductCatalogOrgan {
  initialize(): Promise<void>;
  execute(command: ProductCatalogCommand): Promise<ProductCatalogResult>;
  executeOffline(command: ProductCatalogCommand): Promise<ProductCatalogResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ShoppingCartOrgan {
  initialize(): Promise<void>;
  execute(command: ShoppingCartCommand): Promise<ShoppingCartResult>;
  executeOffline(command: ShoppingCartCommand): Promise<ShoppingCartResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface CheckoutEngineOrgan {
  initialize(): Promise<void>;
  execute(command: CheckoutEngineCommand): Promise<CheckoutEngineResult>;
  executeOffline(command: CheckoutEngineCommand): Promise<CheckoutEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface OrderManagerOrgan {
  initialize(): Promise<void>;
  execute(command: OrderManagerCommand): Promise<OrderManagerResult>;
  executeOffline(command: OrderManagerCommand): Promise<OrderManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface PaymentGatewayOrgan {
  initialize(): Promise<void>;
  execute(command: PaymentGatewayCommand): Promise<PaymentGatewayResult>;
  executeOffline(command: PaymentGatewayCommand): Promise<PaymentGatewayResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface ProductCatalogCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ProductCatalogResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ShoppingCartCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ShoppingCartResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface CheckoutEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface CheckoutEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface OrderManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface OrderManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface PaymentGatewayCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface PaymentGatewayResult {
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
