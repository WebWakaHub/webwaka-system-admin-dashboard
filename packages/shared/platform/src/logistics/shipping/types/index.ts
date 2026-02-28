/**
 * Shipping Types
 * 
 * TypeScript interfaces and types for shipping module.
 */

// Carrier Types
export enum CarrierCode {
  DHL = 'dhl',
  FEDEX = 'fedex',
  UPS = 'ups',
  USPS = 'usps',
  KWIK = 'kwik',
  GIG = 'gig'
}

export enum CarrierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum ServiceType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  ECONOMY = 'economy',
  SAME_DAY = 'same_day'
}

// Shipment Types
export enum ShipmentStatus {
  PENDING = 'pending',
  LABEL_GENERATED = 'label_generated',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  DELIVERY_FAILED = 'delivery_failed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled'
}

// Tracking Types
export enum TrackingEventType {
  LABEL_CREATED = 'label_created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  DELIVERY_ATTEMPTED = 'delivery_attempted',
  DELIVERY_FAILED = 'delivery_failed',
  EXCEPTION = 'exception',
  RETURNED = 'returned'
}

// Address Types
export interface Address {
  name: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email?: string;
}

// Package Types
export interface PackageDetails {
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  declared_value: number;
  contents_description: string;
}

// DTOs
export interface CreateCarrierDTO {
  tenant_id: string;
  carrier_code: CarrierCode;
  carrier_name: string;
  account_number: string;
  api_credentials: Record<string, any>;
  supported_services: ServiceType[];
}

export interface UpdateCarrierDTO {
  carrier_name?: string;
  account_number?: string;
  api_credentials?: Record<string, any>;
  status?: CarrierStatus;
  supported_services?: ServiceType[];
}

export interface CreateShipmentDTO {
  tenant_id: string;
  order_id: string;
  carrier_id: string;
  service_type: ServiceType;
  from_address: Address;
  to_address: Address;
  packages: PackageDetails[];
  special_instructions?: string;
  scheduled_pickup_date?: Date;
}

export interface UpdateShipmentDTO {
  status?: ShipmentStatus;
  tracking_number?: string;
  label_url?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  delivery_signature?: string;
}

export interface RateQuoteRequest {
  tenant_id: string;
  from_address: Address;
  to_address: Address;
  packages: PackageDetails[];
  service_types?: ServiceType[];
}

export interface RateQuote {
  carrier_id: string;
  carrier_code: CarrierCode;
  carrier_name: string;
  service_type: ServiceType;
  rate: number;
  currency: string;
  estimated_days: number;
  estimated_delivery_date: Date;
}

export interface TrackingEventDTO {
  shipment_id: string;
  tracking_number: string;
  event_type: TrackingEventType;
  event_description: string;
  event_location: string;
  event_timestamp: Date;
  carrier_event_code?: string;
}

export interface ShipmentFilterDTO {
  tenant_id: string;
  status?: ShipmentStatus;
  carrier_id?: string;
  order_id?: string;
  date_from?: Date;
  date_to?: Date;
  page?: number;
  limit?: number;
}

export interface CarrierFilterDTO {
  tenant_id: string;
  status?: CarrierStatus;
  carrier_code?: CarrierCode;
  page?: number;
  limit?: number;
}
