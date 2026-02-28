/**
 * Hospitality Booking Engine - Type Definitions
 * 
 * Comprehensive TypeScript type definitions for the booking engine.
 * Includes DTOs, enums, interfaces, and utility types.
 * 
 * @module hospitality-booking-engine/types
 * @author webwakaagent4
 */

/**
 * Booking Status Enum
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Payment Gateway Enum
 */
export enum PaymentGateway {
  PAYSTACK = 'paystack',
  FLUTTERWAVE = 'flutterwave',
  INTERSWITCH = 'interswitch',
}

/**
 * Payment Method Enum
 */
export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  USSD = 'ussd',
  MOBILE_MONEY = 'mobile_money',
}

/**
 * Refund Status Enum
 */
export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Sync Status Enum
 */
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  FAILED = 'failed',
}

/**
 * Event Type Enum
 */
export enum EventType {
  BOOKING_CREATED = 'booking.created',
  BOOKING_MODIFIED = 'booking.modified',
  BOOKING_CANCELLED = 'booking.cancelled',
  PAYMENT_COMPLETED = 'payment.completed',
  BOOKING_SYNCED = 'booking.synced',
}

/**
 * Currency Enum
 */
export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
}

/**
 * Availability Search Request DTO
 */
export interface AvailabilitySearchRequest {
  tenantId: string;
  propertyId?: string;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
  adultsCount: number;
  childrenCount?: number;
  roomTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'availability';
  page?: number;
  pageSize?: number;
}

/**
 * Availability Search Response DTO
 */
export interface AvailabilitySearchResponse {
  properties: PropertyAvailability[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Property Availability DTO
 */
export interface PropertyAvailability {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  location: string;
  rating: number;
  images: string[];
  roomTypes: RoomTypeAvailability[];
}

/**
 * Room Type Availability DTO
 */
export interface RoomTypeAvailability {
  roomTypeId: string;
  roomTypeName: string;
  description: string;
  capacity: {
    adults: number;
    children: number;
  };
  amenities: string[];
  images: string[];
  availableRooms: number;
  ratePlans: RatePlan[];
}

/**
 * Rate Plan DTO
 */
export interface RatePlan {
  ratePlanId: string;
  ratePlanName: string;
  pricePerNight: number;
  currency: Currency;
  totalPrice: number;
  cancellationPolicy: string;
  inclusions: string[];
}

/**
 * Create Booking Request DTO
 */
export interface CreateBookingRequest {
  tenantId: string;
  propertyId: string;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
  adultsCount: number;
  childrenCount?: number;
  rooms: BookingRoomRequest[];
  guest: GuestRequest;
  specialRequests?: string;
  paymentGateway: PaymentGateway;
}

/**
 * Booking Room Request DTO
 */
export interface BookingRoomRequest {
  roomTypeId: string;
  ratePlanId: string;
  quantity: number;
}

/**
 * Guest Request DTO
 */
export interface GuestRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // +234XXXXXXXXXX format
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  ndprConsent: boolean;
  marketingConsent?: boolean;
}

/**
 * Create Booking Response DTO
 */
export interface CreateBookingResponse {
  bookingId: string;
  referenceNumber: string;
  status: BookingStatus;
  totalAmount: number;
  currency: Currency;
  paymentUrl: string;
  expiresAt: string; // ISO 8601 format
}

/**
 * Get Booking Response DTO
 */
export interface GetBookingResponse {
  booking: BookingDetails;
}

/**
 * Booking Details DTO
 */
export interface BookingDetails {
  id: string;
  referenceNumber: string;
  tenantId: string;
  propertyId: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  adultsCount: number;
  childrenCount: number;
  rooms: BookingRoomDetails[];
  guest: GuestDetails;
  totalAmount: number;
  currency: Currency;
  status: BookingStatus;
  specialRequests?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  refundAmount?: number;
  refundStatus?: RefundStatus;
  payment?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

/**
 * Booking Room Details DTO
 */
export interface BookingRoomDetails {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  quantity: number;
  pricePerNight: number;
  totalPrice: number;
  currency: Currency;
  ratePlanId?: string;
  ratePlanName?: string;
}

/**
 * Guest Details DTO
 */
export interface GuestDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  ndprConsent?: string;
  marketingConsent?: string;
}

/**
 * Payment Details DTO
 */
export interface PaymentDetails {
  id: string;
  amount: number;
  currency: Currency;
  gateway: PaymentGateway;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  cardLast4?: string;
  cardBrand?: string;
  refundedAmount?: number;
  refundedAt?: string;
  createdAt: string;
}

/**
 * Modify Booking Request DTO
 */
export interface ModifyBookingRequest {
  checkInDate?: string;
  checkOutDate?: string;
  adultsCount?: number;
  childrenCount?: number;
  rooms?: BookingRoomRequest[];
  specialRequests?: string;
  version: number; // For optimistic locking
}

/**
 * Modify Booking Response DTO
 */
export interface ModifyBookingResponse {
  booking: BookingDetails;
  priceAdjustment?: number;
  paymentRequired?: boolean;
  paymentUrl?: string;
}

/**
 * Cancel Booking Request DTO
 */
export interface CancelBookingRequest {
  reason: string;
}

/**
 * Cancel Booking Response DTO
 */
export interface CancelBookingResponse {
  bookingId: string;
  status: BookingStatus;
  refundAmount: number;
  refundStatus: RefundStatus;
  cancellationDate: string;
}

/**
 * Payment Gateway Response Interface
 */
export interface PaymentGatewayResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  reference?: string;
  error?: string;
}

/**
 * Payment Verification Response Interface
 */
export interface PaymentVerificationResponse {
  success: boolean;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  paymentMethod?: PaymentMethod;
  cardLast4?: string;
  cardBrand?: string;
  transactionId: string;
  reference: string;
  paidAt?: string;
  error?: string;
}

/**
 * Event Payload Interface
 */
export interface EventPayload {
  eventType: EventType;
  eventId: string;
  tenantId: string;
  occurredAt: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Booking Created Event Data
 */
export interface BookingCreatedEventData {
  bookingId: string;
  referenceNumber: string;
  propertyId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: Currency;
  rooms: Array<{
    roomTypeId: string;
    quantity: number;
  }>;
}

/**
 * Booking Modified Event Data
 */
export interface BookingModifiedEventData {
  bookingId: string;
  referenceNumber: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

/**
 * Booking Cancelled Event Data
 */
export interface BookingCancelledEventData {
  bookingId: string;
  referenceNumber: string;
  cancellationReason: string;
  refundAmount: number;
  refundStatus: RefundStatus;
}

/**
 * Payment Completed Event Data
 */
export interface PaymentCompletedEventData {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: Currency;
  gateway: PaymentGateway;
  transactionId: string;
}

/**
 * Booking Synced Event Data
 */
export interface BookingSyncedEventData {
  bookingId: string;
  syncStatus: SyncStatus;
  conflicts?: Array<{
    field: string;
    localValue: any;
    serverValue: any;
  }>;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination Response
 */
export interface PaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Filter Options
 */
export interface FilterOptions {
  [key: string]: any;
}

/**
 * Sort Options
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Utility Types
 */

/**
 * Partial Update Type
 * Makes all properties optional except specified keys
 */
export type PartialUpdate<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Omit Audit Fields Type
 * Removes audit fields from a type
 */
export type OmitAuditFields<T> = Omit<T, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt'>;

/**
 * With Tenant Type
 * Adds tenantId to a type
 */
export type WithTenant<T> = T & { tenantId: string };
