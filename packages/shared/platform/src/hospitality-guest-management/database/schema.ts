/**
 * Guest Management Database Schema
 * 
 * @author webwakaagent4
 * @step 447
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, integer, boolean, index } from 'drizzle-orm/pg-core';

/**
 * Guests Table
 */
export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  
  // Personal Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(), // +234 format
  dateOfBirth: timestamp('date_of_birth'),
  nationality: varchar('nationality', { length: 100 }),
  
  // Address (Nigerian-First)
  address: jsonb('address'), // { street, city, state, country, postalCode }
  
  // Identity Verification
  identityType: varchar('identity_type', { length: 50 }), // 'nin', 'passport', 'drivers_license'
  identityNumber: varchar('identity_number', { length: 100 }),
  identityVerified: boolean('identity_verified').default(false),
  
  // Profile
  profilePhoto: text('profile_photo'),
  bio: text('bio'),
  
  // Emergency Contact
  emergencyContact: jsonb('emergency_contact'), // { name, relationship, phone }
  
  // Special Requirements
  specialRequirements: jsonb('special_requirements'), // { dietary, accessibility, allergies }
  
  // NDPR Compliance
  consentGiven: boolean('consent_given').default(false),
  consentDate: timestamp('consent_date'),
  dataPortabilityRequested: boolean('data_portability_requested').default(false),
  deletionRequested: boolean('deletion_requested').default(false),
  deletionRequestedAt: timestamp('deletion_requested_at'),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'inactive', 'blocked'
  vipStatus: boolean('vip_status').default(false),
  
  // Loyalty
  loyaltyTier: varchar('loyalty_tier', { length: 20 }).default('bronze'), // 'bronze', 'silver', 'gold', 'platinum'
  loyaltyPoints: integer('loyalty_points').default(0),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  tenantIdx: index('idx_guests_tenant').on(table.tenantId),
  emailIdx: index('idx_guests_email').on(table.email),
  phoneIdx: index('idx_guests_phone').on(table.phone),
  statusIdx: index('idx_guests_status').on(table.status),
  loyaltyTierIdx: index('idx_guests_loyalty_tier').on(table.loyaltyTier),
}));

/**
 * Guest Preferences Table
 */
export const guestPreferences = pgTable('guest_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id),
  
  // Room Preferences
  roomPreferences: jsonb('room_preferences'), // { floor, view, bedType, smoking }
  
  // Amenity Preferences
  amenityPreferences: jsonb('amenity_preferences'), // { pillowType, temperature, minibar }
  
  // Service Preferences
  servicePreferences: jsonb('service_preferences'), // { housekeepingSchedule, wakeUpCalls }
  
  // Communication Preferences
  communicationPreferences: jsonb('communication_preferences'), // { email, sms, whatsapp }
  
  // Other
  languagePreference: varchar('language_preference', { length: 10 }).default('en'),
  dietaryPreferences: jsonb('dietary_preferences'),
  accessibilityRequirements: jsonb('accessibility_requirements'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  guestIdx: index('idx_guest_preferences_guest').on(table.guestId),
}));

/**
 * Guest Communications Table
 */
export const guestCommunications = pgTable('guest_communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id),
  tenantId: uuid('tenant_id').notNull(),
  
  // Communication Details
  type: varchar('type', { length: 50 }).notNull(), // 'email', 'sms', 'whatsapp', 'phone', 'in_person'
  direction: varchar('direction', { length: 20 }).notNull(), // 'inbound', 'outbound'
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  
  // Metadata
  sentBy: uuid('sent_by'), // User ID
  sentAt: timestamp('sent_at').notNull(),
  deliveryStatus: varchar('delivery_status', { length: 20 }).default('pending'), // 'pending', 'sent', 'delivered', 'failed'
  
  // Related Entities
  bookingId: uuid('booking_id'),
  propertyId: uuid('property_id'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  guestIdx: index('idx_guest_communications_guest').on(table.guestId),
  typeIdx: index('idx_guest_communications_type').on(table.type),
  sentAtIdx: index('idx_guest_communications_sent_at').on(table.sentAt),
}));

/**
 * Guest Feedback Table
 */
export const guestFeedback = pgTable('guest_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id),
  tenantId: uuid('tenant_id').notNull(),
  bookingId: uuid('booking_id'),
  propertyId: uuid('property_id').notNull(),
  
  // Ratings
  overallRating: integer('overall_rating').notNull(), // 1-5
  cleanlinessRating: integer('cleanliness_rating'),
  serviceRating: integer('service_rating'),
  valueRating: integer('value_rating'),
  locationRating: integer('location_rating'),
  amenitiesRating: integer('amenities_rating'),
  
  // Feedback
  title: varchar('title', { length: 255 }),
  comment: text('comment'),
  
  // Response
  responseText: text('response_text'),
  respondedBy: uuid('responded_by'),
  respondedAt: timestamp('responded_at'),
  
  // Status
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'published', 'hidden'
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  guestIdx: index('idx_guest_feedback_guest').on(table.guestId),
  propertyIdx: index('idx_guest_feedback_property').on(table.propertyId),
  ratingIdx: index('idx_guest_feedback_rating').on(table.overallRating),
  statusIdx: index('idx_guest_feedback_status').on(table.status),
}));

/**
 * Loyalty Transactions Table
 */
export const loyaltyTransactions = pgTable('loyalty_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id),
  tenantId: uuid('tenant_id').notNull(),
  
  // Transaction Details
  type: varchar('type', { length: 50 }).notNull(), // 'earn', 'redeem', 'expire', 'adjustment'
  points: integer('points').notNull(),
  description: text('description').notNull(),
  
  // Related Entities
  bookingId: uuid('booking_id'),
  
  // Balance
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  
  // Expiry
  expiresAt: timestamp('expires_at'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  guestIdx: index('idx_loyalty_transactions_guest').on(table.guestId),
  typeIdx: index('idx_loyalty_transactions_type').on(table.type),
  createdIdx: index('idx_loyalty_transactions_created').on(table.createdAt),
}));

/**
 * Type exports
 */
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type GuestPreferences = typeof guestPreferences.$inferSelect;
export type NewGuestPreferences = typeof guestPreferences.$inferInsert;
export type GuestCommunication = typeof guestCommunications.$inferSelect;
export type NewGuestCommunication = typeof guestCommunications.$inferInsert;
export type GuestFeedback = typeof guestFeedback.$inferSelect;
export type NewGuestFeedback = typeof guestFeedback.$inferInsert;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type NewLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;
