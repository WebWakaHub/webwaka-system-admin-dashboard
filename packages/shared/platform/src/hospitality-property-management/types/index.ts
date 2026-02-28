/**
 * Property Management - Type Definitions
 * 
 * TypeScript types and interfaces for Property Management module.
 * 
 * @module hospitality-property-management/types
 * @author webwakaagent4
 */

// Enums
export enum PropertyType {
  HOTEL = 'hotel',
  HOSTEL = 'hostel',
  VACATION_RENTAL = 'vacation_rental',
  GUESTHOUSE = 'guesthouse',
  RESORT = 'resort',
}

export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum CancellationPolicy {
  FLEXIBLE = 'flexible',
  MODERATE = 'moderate',
  STRICT = 'strict',
  NON_REFUNDABLE = 'non_refundable',
}

export enum PaymentPolicy {
  PAY_NOW = 'pay_now',
  PAY_LATER = 'pay_later',
  PARTIAL_PAYMENT = 'partial_payment',
}

export enum RoomTypeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum RatePlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AmenityCategory {
  GENERAL = 'general',
  RECREATION = 'recreation',
  BUSINESS = 'business',
  DINING = 'dining',
  WELLNESS = 'wellness',
}

// Interfaces
export interface Address {
  street: string;
  city: string;
  state: string;
  lga: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Contact {
  phone: string;
  email: string;
  website?: string;
}

export interface Capacity {
  adults: number;
  children: number;
  infants: number;
}

export interface DayOfWeekPricing {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface SeasonalPricing {
  name: string;
  startDate: Date;
  endDate: Date;
  multiplier: number;
}

export interface OccupancyPricing {
  singleOccupancy: number;
  doubleOccupancy: number;
  tripleOccupancy: number;
}

export interface LengthOfStayDiscount {
  minimumNights: number;
  discountPercentage: number;
}

export interface OperatingHours {
  openTime: string;
  closeTime: string;
  days: string[];
}

// DTOs
export interface CreatePropertyDTO {
  name: string;
  type: PropertyType;
  description?: string;
  address: Address;
  contact: Contact;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: CancellationPolicy;
  paymentPolicy: PaymentPolicy;
  houseRules?: string[];
}

export interface UpdatePropertyDTO {
  name?: string;
  description?: string;
  address?: Address;
  contact?: Contact;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: CancellationPolicy;
  paymentPolicy?: PaymentPolicy;
  houseRules?: string[];
  status?: PropertyStatus;
}

export interface CreateRoomTypeDTO {
  name: string;
  description?: string;
  capacity: Capacity;
  size: number;
  amenities?: string[];
  images?: string[];
  inventory: number;
}

export interface UpdateRoomTypeDTO {
  name?: string;
  description?: string;
  capacity?: Capacity;
  size?: number;
  amenities?: string[];
  images?: string[];
  inventory?: number;
  status?: RoomTypeStatus;
}

export interface CreateRatePlanDTO {
  roomTypeId: string;
  name: string;
  description?: string;
  basePrice: number;
  currency?: string;
  validFrom: Date;
  validTo: Date;
  dayOfWeekPricing: DayOfWeekPricing;
  seasonalPricing?: SeasonalPricing[];
  occupancyPricing: OccupancyPricing;
  lengthOfStayDiscounts?: LengthOfStayDiscount[];
  isPublic?: boolean;
  accessCode?: string;
}

export interface UpdateRatePlanDTO {
  name?: string;
  description?: string;
  basePrice?: number;
  validFrom?: Date;
  validTo?: Date;
  dayOfWeekPricing?: DayOfWeekPricing;
  seasonalPricing?: SeasonalPricing[];
  occupancyPricing?: OccupancyPricing;
  lengthOfStayDiscounts?: LengthOfStayDiscount[];
  isPublic?: boolean;
  accessCode?: string;
  status?: RatePlanStatus;
}

export interface UpdateAvailabilityDTO {
  date: Date;
  inventory?: number;
  minimumStay?: number;
  maximumStay?: number;
  isStopSell?: boolean;
  isBlocked?: boolean;
  blockReason?: string;
}

export interface CreateAmenityDTO {
  name: string;
  category: AmenityCategory;
  description?: string;
  icon?: string;
  isFree?: boolean;
  price?: number;
  operatingHours?: OperatingHours;
}

// Response types
export interface Property {
  id: string;
  tenantId: string;
  groupId?: string;
  name: string;
  type: PropertyType;
  description?: string;
  address: Address;
  contact: Contact;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: CancellationPolicy;
  paymentPolicy: PaymentPolicy;
  houseRules?: string[];
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  capacity: Capacity;
  size: number;
  amenities?: string[];
  images?: string[];
  inventory: number;
  status: RoomTypeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatePlan {
  id: string;
  propertyId: string;
  roomTypeId: string;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  validFrom: Date;
  validTo: Date;
  dayOfWeekPricing: DayOfWeekPricing;
  seasonalPricing?: SeasonalPricing[];
  occupancyPricing: OccupancyPricing;
  lengthOfStayDiscounts?: LengthOfStayDiscount[];
  isPublic: boolean;
  accessCode?: string;
  status: RatePlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  propertyId: string;
  roomTypeId: string;
  date: Date;
  inventory: number;
  minimumStay: number;
  maximumStay: number;
  isStopSell: boolean;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyAmenity {
  id: string;
  propertyId: string;
  name: string;
  category: AmenityCategory;
  description?: string;
  icon?: string;
  isFree: boolean;
  price?: number;
  operatingHours?: OperatingHours;
  createdAt: Date;
}

// Analytics types
export interface PropertyAnalytics {
  propertyId: string;
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  totalRevenue: number;
  totalBookings: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}
