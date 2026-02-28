/**
 * Inventory Management Types
 * 
 * Type definitions for the Inventory Management module
 * Following WebWaka architectural invariants:
 * - Multi-tenant isolation (tenant_id required)
 * - Offline-first (sync status tracking)
 * - Event-driven (event types defined)
 * - Plugin-first (extensible interfaces)
 */

// ============================================================================
// Core Types
// ============================================================================

export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'KES' | 'GHS';
export type ValuationMethod = 'fifo' | 'lifo' | 'weighted_average';
export type MovementType = 'receipt' | 'transfer' | 'adjustment' | 'return' | 'reservation' | 'allocation';
export type MovementStatus = 'pending' | 'completed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ReservationStatus = 'active' | 'expired' | 'released' | 'allocated';
export type AlertType = 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

// ============================================================================
// Inventory Entity
// ============================================================================

export interface Inventory {
  id: string;
  tenant_id: string;
  sku: string;
  product_id: string;
  location_id: string;
  on_hand: number;
  available: number;
  reserved: number;
  allocated: number;
  committed: number;
  reorder_point?: number;
  safety_stock?: number;
  unit_cost?: number;
  total_value?: number;
  currency: Currency;
  valuation_method: ValuationMethod;
  last_movement_id?: string;
  last_movement_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInventoryInput {
  tenant_id: string;
  sku: string;
  product_id: string;
  location_id: string;
  on_hand?: number;
  reorder_point?: number;
  safety_stock?: number;
  unit_cost?: number;
  currency?: Currency;
  valuation_method?: ValuationMethod;
}

export interface UpdateInventoryInput {
  on_hand?: number;
  available?: number;
  reserved?: number;
  allocated?: number;
  committed?: number;
  reorder_point?: number;
  safety_stock?: number;
  unit_cost?: number;
  total_value?: number;
}

export interface InventoryQuery {
  tenant_id: string;
  sku?: string;
  product_id?: string;
  location_id?: string;
  include_history?: boolean;
}

// ============================================================================
// Stock Movement Entity
// ============================================================================

export interface StockMovement {
  id: string;
  tenant_id: string;
  movement_type: MovementType;
  reference_number?: string;
  from_location_id?: string;
  to_location_id?: string;
  movement_date: Date;
  reason?: string;
  status: MovementStatus;
  approval_required: boolean;
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_at?: Date;
  total_value?: number;
  currency: Currency;
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface StockMovementItem {
  id: string;
  tenant_id: string;
  movement_id: string;
  sku: string;
  product_id: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  batch_number?: string;
  serial_number?: string;
  expiry_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStockMovementInput {
  tenant_id: string;
  movement_type: MovementType;
  reference_number?: string;
  from_location_id?: string;
  to_location_id?: string;
  movement_date: Date;
  reason?: string;
  items: CreateStockMovementItemInput[];
  notes?: string;
  created_by: string;
}

export interface CreateStockMovementItemInput {
  sku: string;
  product_id: string;
  quantity: number;
  unit_cost?: number;
  batch_number?: string;
  serial_number?: string;
  expiry_date?: Date;
}

// ============================================================================
// Inventory Reservation Entity
// ============================================================================

export interface InventoryReservation {
  id: string;
  tenant_id: string;
  order_id: string;
  sku: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reservation_expires_at: Date;
  status: ReservationStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReservationInput {
  tenant_id: string;
  order_id: string;
  location_id: string;
  items: CreateReservationItemInput[];
  reservation_expires_at: Date;
}

export interface CreateReservationItemInput {
  sku: string;
  product_id: string;
  quantity: number;
}

// ============================================================================
// Inventory Alert Entity
// ============================================================================

export interface InventoryAlert {
  id: string;
  tenant_id: string;
  alert_type: AlertType;
  sku: string;
  product_id: string;
  location_id: string;
  current_stock?: number;
  reorder_point?: number;
  expiry_date?: Date;
  batch_number?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Inventory Valuation
// ============================================================================

export interface InventoryValuation {
  location_id: string;
  location_name: string;
  valuation_method: ValuationMethod;
  total_inventory_value: number;
  currency: Currency;
  item_count: number;
  sku_count: number;
  valuation_date: Date;
}

export interface ValuationCalculation {
  sku: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  valuation_method: ValuationMethod;
}

// ============================================================================
// Reconciliation
// ============================================================================

export interface ReconciliationRecord {
  id: string;
  tenant_id: string;
  location_id: string;
  reconciliation_date: Date;
  total_items_counted: number;
  items_with_variance: number;
  total_variance_value: number;
  currency: Currency;
  approval_required: boolean;
  approval_status: ApprovalStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReconciliationItem {
  sku: string;
  product_id: string;
  expected_quantity: number;
  actual_quantity: number;
  adjustment_quantity: number;
  variance_percentage: number;
}

export interface CreateReconciliationInput {
  tenant_id: string;
  location_id: string;
  reconciliation_date: Date;
  items: ReconciliationItem[];
  created_by: string;
}

// ============================================================================
// Event Types
// ============================================================================

export interface InventoryStockLevelChangedEvent {
  eventType: 'inventory.stock_level_changed';
  eventId: string;
  timestamp: Date;
  tenantId: string;
  data: {
    sku: string;
    location_id: string;
    previous_on_hand: number;
    new_on_hand: number;
    previous_available: number;
    new_available: number;
    change_quantity: number;
    change_reason: MovementType;
    movement_id: string;
    reference_number?: string;
  };
}

export interface InventoryLowStockAlertEvent {
  eventType: 'inventory.low_stock_alert';
  eventId: string;
  timestamp: Date;
  tenantId: string;
  data: {
    sku: string;
    product_name: string;
    location_id: string;
    location_name: string;
    current_stock: number;
    reorder_point: number;
    safety_stock: number;
    recommended_order_quantity: number;
    alert_severity: AlertSeverity;
  };
}

export interface InventoryReconciliationCompletedEvent {
  eventType: 'inventory.reconciliation_completed';
  eventId: string;
  timestamp: Date;
  tenantId: string;
  data: {
    reconciliation_id: string;
    location_id: string;
    location_name: string;
    reconciliation_date: Date;
    total_items_counted: number;
    items_with_variance: number;
    total_variance_value: number;
    currency: Currency;
    approval_required: boolean;
    approval_status: ApprovalStatus;
  };
}

export interface InventoryBatchExpiringSoonEvent {
  eventType: 'inventory.batch_expiring_soon';
  eventId: string;
  timestamp: Date;
  tenantId: string;
  data: {
    sku: string;
    product_name: string;
    batch_number: string;
    location_id: string;
    location_name: string;
    quantity: number;
    expiry_date: Date;
    days_until_expiry: number;
    alert_severity: AlertSeverity;
  };
}

export type InventoryEvent =
  | InventoryStockLevelChangedEvent
  | InventoryLowStockAlertEvent
  | InventoryReconciliationCompletedEvent
  | InventoryBatchExpiringSoonEvent;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// Sync Types (Offline-First)
// ============================================================================

export interface SyncOperation {
  id: string;
  tenant_id: string;
  operation_type: 'create' | 'update' | 'delete';
  entity_type: 'inventory' | 'stock_movement' | 'reservation' | 'alert';
  entity_id?: string;
  payload: any;
  status: 'queued' | 'syncing' | 'completed' | 'failed';
  retry_count: number;
  max_retries: number;
  created_at: Date;
  updated_at: Date;
}

export interface SyncStatus {
  is_online: boolean;
  queued_operations: number;
  last_sync_at?: Date;
  sync_in_progress: boolean;
}

// ============================================================================
// Service Interfaces
// ============================================================================

export interface IInventoryService {
  getInventory(query: InventoryQuery): Promise<Inventory[]>;
  getInventoryBySku(tenant_id: string, sku: string, location_id?: string): Promise<Inventory | null>;
  createInventory(input: CreateInventoryInput): Promise<Inventory>;
  updateInventory(id: string, input: UpdateInventoryInput): Promise<Inventory>;
  reserveInventory(input: CreateReservationInput): Promise<InventoryReservation>;
  releaseReservation(reservation_id: string): Promise<void>;
  allocateReservation(reservation_id: string): Promise<void>;
  checkAvailability(tenant_id: string, sku: string, location_id: string, quantity: number): Promise<boolean>;
}

export interface IStockMovementService {
  createReceipt(input: CreateStockMovementInput): Promise<StockMovement>;
  createTransfer(input: CreateStockMovementInput): Promise<StockMovement>;
  createAdjustment(input: CreateStockMovementInput): Promise<StockMovement>;
  createReturn(input: CreateStockMovementInput): Promise<StockMovement>;
  approveMovement(movement_id: string, approved_by: string): Promise<StockMovement>;
  rejectMovement(movement_id: string, approved_by: string): Promise<StockMovement>;
  getMovementHistory(tenant_id: string, filters: any): Promise<StockMovement[]>;
}

export interface IValuationService {
  calculateValuation(tenant_id: string, location_id?: string): Promise<InventoryValuation>;
  calculateFIFOValuation(tenant_id: string, sku: string, location_id: string): Promise<ValuationCalculation>;
  calculateLIFOValuation(tenant_id: string, sku: string, location_id: string): Promise<ValuationCalculation>;
  calculateWeightedAverageValuation(tenant_id: string, sku: string, location_id: string): Promise<ValuationCalculation>;
}

export interface IAlertService {
  generateLowStockAlert(inventory: Inventory): Promise<InventoryAlert | null>;
  generateExpiryAlert(tenant_id: string, sku: string, location_id: string, batch_number: string, expiry_date: Date): Promise<InventoryAlert | null>;
  acknowledgeAlert(alert_id: string, acknowledged_by: string): Promise<InventoryAlert>;
  resolveAlert(alert_id: string): Promise<InventoryAlert>;
  getActiveAlerts(tenant_id: string, filters: any): Promise<InventoryAlert[]>;
}

export interface IReconciliationService {
  createReconciliation(input: CreateReconciliationInput): Promise<ReconciliationRecord>;
  calculateVariance(expected: number, actual: number): { adjustment: number; variance_percentage: number };
  requiresApproval(variance_percentage: number): boolean;
  approveReconciliation(reconciliation_id: string, approved_by: string): Promise<ReconciliationRecord>;
  rejectReconciliation(reconciliation_id: string, approved_by: string): Promise<ReconciliationRecord>;
}

export interface ISyncService {
  queueOperation(operation: Omit<SyncOperation, 'id' | 'created_at' | 'updated_at'>): Promise<SyncOperation>;
  syncQueuedOperations(): Promise<void>;
  getSyncStatus(tenant_id: string): Promise<SyncStatus>;
  clearQueue(tenant_id: string): Promise<void>;
}

export interface IEventPublisher {
  publish(event: InventoryEvent): Promise<void>;
  publishBatch(events: InventoryEvent[]): Promise<void>;
}
