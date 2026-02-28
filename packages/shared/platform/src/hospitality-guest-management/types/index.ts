/**
 * Guest Management Type Definitions
 * 
 * @author webwakaagent4
 * @step 447
 */

// Enums
export type GuestStatus = 'active' | 'inactive' | 'blocked';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type IdentityType = 'nin' | 'passport' | 'drivers_license';
export type CommunicationType = 'email' | 'sms' | 'whatsapp' | 'phone' | 'in_person';
export type CommunicationDirection = 'inbound' | 'outbound';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type FeedbackStatus = 'pending' | 'published' | 'hidden';
export type LoyaltyTransactionType = 'earn' | 'redeem' | 'expire' | 'adjustment';

// DTOs
export interface CreateGuestDTO {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // +234 format
  dateOfBirth?: string;
  nationality?: string;
  address?: Address;
  identityType?: IdentityType;
  identityNumber?: string;
  emergencyContact?: EmergencyContact;
  specialRequirements?: SpecialRequirements;
  consentGiven: boolean;
}

export interface UpdateGuestDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: Address;
  profilePhoto?: string;
  bio?: string;
  emergencyContact?: EmergencyContact;
  specialRequirements?: SpecialRequirements;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface SpecialRequirements {
  dietary?: string[];
  accessibility?: string[];
  allergies?: string[];
}

export interface CreateGuestPreferencesDTO {
  guestId: string;
  roomPreferences?: RoomPreferences;
  amenityPreferences?: AmenityPreferences;
  servicePreferences?: ServicePreferences;
  communicationPreferences?: CommunicationPreferences;
  languagePreference?: string;
  dietaryPreferences?: string[];
  accessibilityRequirements?: string[];
}

export interface RoomPreferences {
  floor?: string; // 'low', 'mid', 'high'
  view?: string; // 'city', 'ocean', 'garden'
  bedType?: string; // 'single', 'double', 'king', 'twin'
  smoking?: boolean;
}

export interface AmenityPreferences {
  pillowType?: string; // 'soft', 'firm', 'memory_foam'
  temperature?: number; // Celsius
  minibar?: boolean;
}

export interface ServicePreferences {
  housekeepingSchedule?: string; // 'morning', 'afternoon', 'evening'
  wakeUpCalls?: boolean;
  doNotDisturb?: boolean;
}

export interface CommunicationPreferences {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
  marketingConsent?: boolean;
}

export interface SendCommunicationDTO {
  guestId: string;
  tenantId: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  sentBy: string;
  bookingId?: string;
  propertyId?: string;
}

export interface CreateFeedbackDTO {
  guestId: string;
  tenantId: string;
  bookingId?: string;
  propertyId: string;
  overallRating: number; // 1-5
  cleanlinessRating?: number;
  serviceRating?: number;
  valueRating?: number;
  locationRating?: number;
  amenitiesRating?: number;
  title?: string;
  comment?: string;
}

export interface RespondToFeedbackDTO {
  feedbackId: string;
  responseText: string;
  respondedBy: string;
}

export interface EarnLoyaltyPointsDTO {
  guestId: string;
  tenantId: string;
  points: number;
  description: string;
  bookingId?: string;
}

export interface RedeemLoyaltyPointsDTO {
  guestId: string;
  tenantId: string;
  points: number;
  description: string;
  bookingId?: string;
}

// Response DTOs
export interface GuestResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: GuestStatus;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  vipStatus: boolean;
  createdAt: string;
}

export interface GuestProfileResponse extends GuestResponse {
  dateOfBirth?: string;
  nationality?: string;
  address?: Address;
  identityType?: IdentityType;
  identityVerified: boolean;
  profilePhoto?: string;
  bio?: string;
  emergencyContact?: EmergencyContact;
  specialRequirements?: SpecialRequirements;
  preferences?: GuestPreferences;
}

export interface GuestPreferences {
  roomPreferences?: RoomPreferences;
  amenityPreferences?: AmenityPreferences;
  servicePreferences?: ServicePreferences;
  communicationPreferences?: CommunicationPreferences;
  languagePreference?: string;
  dietaryPreferences?: string[];
  accessibilityRequirements?: string[];
}

export interface FeedbackResponse {
  id: string;
  guestName: string;
  propertyId: string;
  overallRating: number;
  title?: string;
  comment?: string;
  responseText?: string;
  respondedAt?: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface LoyaltyTransactionResponse {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

// Event Types
export interface GuestCreatedEvent {
  eventId: string;
  eventType: 'guest.created';
  eventVersion: '1.0';
  timestamp: string;
  tenantId: string;
  data: {
    guestId: string;
    email: string;
    phone: string;
  };
}

export interface LoyaltyPointsEarnedEvent {
  eventId: string;
  eventType: 'guest.loyalty.points_earned';
  eventVersion: '1.0';
  timestamp: string;
  tenantId: string;
  data: {
    guestId: string;
    points: number;
    newBalance: number;
    newTier?: LoyaltyTier;
  };
}

export interface FeedbackSubmittedEvent {
  eventId: string;
  eventType: 'guest.feedback.submitted';
  eventVersion: '1.0';
  timestamp: string;
  tenantId: string;
  data: {
    feedbackId: string;
    guestId: string;
    propertyId: string;
    overallRating: number;
  };
}
