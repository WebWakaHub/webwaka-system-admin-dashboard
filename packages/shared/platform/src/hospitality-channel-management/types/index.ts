/**
 * Channel Management Type Definitions
 * 
 * @author webwakaagent4
 * @step 438
 */

// Channel Types
export type ChannelType = 'booking_com' | 'expedia' | 'airbnb' | 'hotels_com';

export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'pending';

export type AuthType = 'oauth' | 'api_key' | 'xml_api';

export type OperationType = 'inventory' | 'rate' | 'availability' | 'booking';

export type Direction = 'push' | 'pull';

export type DistributionStatus = 'pending' | 'success' | 'failed' | 'retrying';

export type ParityStatus = 'compliant' | 'violation' | 'warning';

export type BookingStatus = 'confirmed' | 'cancelled' | 'modified';

export type SyncStatus = 'pending' | 'synced' | 'failed';

// DTOs
export interface CreateChannelConnectionDTO {
  tenantId: string;
  propertyId: string;
  channelType: ChannelType;
  channelName: string;
  authType: AuthType;
  credentials: ChannelCredentials;
  config: ChannelConfig;
  commissionRate?: number;
}

export interface ChannelCredentials {
  // OAuth
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  
  // API Key
  apiKey?: string;
  apiSecret?: string;
  
  // XML API
  username?: string;
  password?: string;
  hotelId?: string;
}

export interface ChannelConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  webhookUrl?: string;
  features: {
    inventorySync: boolean;
    rateSync: boolean;
    availabilitySync: boolean;
    bookingSync: boolean;
  };
}

export interface CreateChannelMappingDTO {
  connectionId: string;
  internalRoomTypeId: string;
  channelRoomTypeId: string;
  channelRoomTypeName: string;
  priceModifier?: number;
  availabilityOffset?: number;
}

export interface DistributeInventoryDTO {
  connectionId: string;
  roomTypes: RoomTypeInventory[];
}

export interface RoomTypeInventory {
  internalRoomTypeId: string;
  name: string;
  description: string;
  maxOccupancy: number;
  amenities: string[];
  images: string[];
}

export interface DistributeRatesDTO {
  connectionId: string;
  rates: RateDistribution[];
}

export interface RateDistribution {
  internalRoomTypeId: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  currency: string;
  restrictions?: RateRestrictions;
}

export interface RateRestrictions {
  minLengthOfStay?: number;
  maxLengthOfStay?: number;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
}

export interface DistributeAvailabilityDTO {
  connectionId: string;
  availability: AvailabilityDistribution[];
}

export interface AvailabilityDistribution {
  internalRoomTypeId: string;
  date: string;
  availableCount: number;
  status: 'available' | 'unavailable';
}

export interface PullBookingsDTO {
  connectionId: string;
  startDate: string;
  endDate: string;
}

export interface ChannelBookingData {
  channelBookingId: string;
  propertyId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  guestInfo: GuestInfo;
  totalAmount: number;
  currency: string;
  commissionAmount?: number;
  status: BookingStatus;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface RateParityCheck {
  propertyId: string;
  roomTypeId: string;
  date: string;
  rates: Record<string, number>;
  parityStatus: ParityStatus;
  violationDetails?: ParityViolation[];
}

export interface ParityViolation {
  channel: string;
  rate: number;
  baseRate: number;
  difference: number;
  differencePercentage: number;
}

// Response DTOs
export interface ChannelConnectionResponse {
  connectionId: string;
  channelType: ChannelType;
  channelName: string;
  status: ConnectionStatus;
  lastSyncAt?: string;
  createdAt: string;
}

export interface DistributionLogResponse {
  logId: string;
  operationType: OperationType;
  direction: Direction;
  status: DistributionStatus;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface RateParityResponse {
  propertyId: string;
  roomTypeId: string;
  date: string;
  parityStatus: ParityStatus;
  rates: Record<string, number>;
  violations: ParityViolation[];
}

// Channel Adapter Interface
export interface IChannelAdapter {
  connect(credentials: ChannelCredentials): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  
  // Inventory operations
  pushInventory(inventory: RoomTypeInventory[]): Promise<void>;
  
  // Rate operations
  pushRates(rates: RateDistribution[]): Promise<void>;
  
  // Availability operations
  pushAvailability(availability: AvailabilityDistribution[]): Promise<void>;
  
  // Booking operations
  pullBookings(startDate: string, endDate: string): Promise<ChannelBookingData[]>;
  confirmBooking(channelBookingId: string): Promise<void>;
  cancelBooking(channelBookingId: string): Promise<void>;
}

// Event Types
export interface ChannelConnectionCreatedEvent {
  eventId: string;
  eventType: 'channel.connection.created';
  eventVersion: '1.0';
  timestamp: string;
  tenantId: string;
  data: {
    connectionId: string;
    channelType: ChannelType;
    propertyId: string;
  };
}

export interface InventoryDistributedEvent {
  eventId: string;
  eventType: 'channel.inventory.distributed';
  eventVersion: '1.0';
  timestamp: string;
  tenantId: string;
  data: {
    connectionId: string;
    roomTypeCount: number;
    status: DistributionStatus;
  };
}

export interface RateParityViolationEvent {
  eventId: string;
  eventType: 'channel.rate_parity.violation';
  eventVersion: '1.0';
  timestamp: string;
  tenantId: string;
  data: {
    propertyId: string;
    roomTypeId: string;
    date: string;
    violations: ParityViolation[];
  };
}

export interface BookingReceivedEvent {
  eventId: string;
  eventType: 'channel.booking.received';
  eventVersion: '1.0';
  timestamp: string;
  tenantId: string;
  data: {
    connectionId: string;
    channelBookingId: string;
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
  };
}
