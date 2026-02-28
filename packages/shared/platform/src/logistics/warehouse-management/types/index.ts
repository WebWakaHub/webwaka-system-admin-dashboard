/**
 * Warehouse Management Types
 * 
 * TypeScript interfaces and types for warehouse management module.
 */

// Warehouse Types
export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface OperatingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

// Location Types
export enum LocationType {
  BULK = 'bulk',
  PALLET = 'pallet',
  SHELF = 'shelf',
  BIN = 'bin'
}

export enum LocationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  DAMAGED = 'damaged'
}

// Picking Types
export enum PickingType {
  DISCRETE = 'discrete',
  BATCH = 'batch',
  WAVE = 'wave'
}

export enum PickingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PickingItemStatus {
  PENDING = 'pending',
  PICKED = 'picked',
  NOT_FOUND = 'not_found',
  DAMAGED = 'damaged',
  QUANTITY_MISMATCH = 'quantity_mismatch'
}

// Packing Types
export enum PackingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SHIPPED = 'shipped'
}

export interface Dimensions {
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

// Movement Types
export enum MovementType {
  RECEIVING = 'receiving',
  PUTAWAY = 'putaway',
  PICKING = 'picking',
  PACKING = 'packing',
  SHIPPING = 'shipping',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment'
}

// DTOs
export interface CreateWarehouseDTO {
  tenant_id: string;
  code: string;
  name: string;
  address: Address;
  contact_phone: string;
  contact_email: string;
  capacity_sqm: number;
  operating_hours?: OperatingHours;
}

export interface UpdateWarehouseDTO {
  name?: string;
  address?: Address;
  contact_phone?: string;
  contact_email?: string;
  status?: WarehouseStatus;
  operating_hours?: OperatingHours;
}

export interface CreateLocationDTO {
  tenant_id: string;
  warehouse_id: string;
  location_code: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  location_type: LocationType;
  capacity_units: number;
}

export interface CreatePickingListDTO {
  tenant_id: string;
  warehouse_id: string;
  order_ids: string[];
  picking_type: PickingType;
  priority?: number;
}

export interface PickItemDTO {
  quantity_picked: number;
  notes?: string;
}

export interface CreatePackageDTO {
  items: PackageItemDTO[];
  box_type: string;
  weight_kg: number;
  dimensions_cm: Dimensions;
}

export interface PackageItemDTO {
  order_item_id: string;
  sku: string;
  product_name: string;
  quantity: number;
}

export interface WarehouseFilterDTO {
  tenant_id: string;
  status?: WarehouseStatus;
  page?: number;
  limit?: number;
}

export interface LocationFilterDTO {
  tenant_id: string;
  warehouse_id: string;
  zone?: string;
  status?: LocationStatus;
  page?: number;
  limit?: number;
}

export interface PickingListFilterDTO {
  tenant_id: string;
  warehouse_id?: string;
  status?: PickingStatus;
  assigned_to?: string;
  page?: number;
  limit?: number;
}

export interface PackingListFilterDTO {
  tenant_id: string;
  warehouse_id?: string;
  status?: PackingStatus;
  assigned_to?: string;
  page?: number;
  limit?: number;
}
