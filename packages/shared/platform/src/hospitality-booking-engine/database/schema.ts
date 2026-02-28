/**
 * Hospitality Booking Engine - Database Schema
 * 
 * Defines all database entities for the booking engine using Drizzle ORM.
 * All entities are tenant-scoped for multi-tenancy support.
 * 
 * @module hospitality-booking-engine/database/schema
 * @author webwakaagent4
 */

import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Bookings Table
 * 
 * Stores all booking records with tenant isolation, versioning for optimistic locking,
 * and comprehensive audit fields.
 */
export const bookings = pgTable('bookings', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Multi-Tenancy
  tenantId: uuid('tenant_id').notNull(),
  
  // Booking Reference
  referenceNumber: varchar('reference_number', { length: 20 }).notNull().unique(),
  
  // Property Reference
  propertyId: uuid('property_id').notNull(),
  
  // Guest Reference
  guestId: uuid('guest_id').notNull(),
  
  // Booking Dates
  checkInDate: timestamp('check_in_date', { withTimezone: true }).notNull(),
  checkOutDate: timestamp('check_out_date', { withTimezone: true }).notNull(),
  
  // Guest Count
  adultsCount: integer('adults_count').notNull().default(1),
  childrenCount: integer('children_count').notNull().default(0),
  
  // Pricing
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  
  // Booking Status
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  // Status values: pending, confirmed, checked_in, checked_out, cancelled, no_show
  
  // Special Requests
  specialRequests: text('special_requests'),
  
  // Cancellation
  cancellationReason: text('cancellation_reason'),
  cancellationDate: timestamp('cancellation_date', { withTimezone: true }),
  refundAmount: decimal('refund_amount', { precision: 12, scale: 2 }),
  refundStatus: varchar('refund_status', { length: 20 }),
  // Refund status values: pending, processing, completed, failed
  
  // Optimistic Locking
  version: integer('version').notNull().default(1),
  
  // Audit Fields
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  
  // Soft Delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  // Indexes for common queries
  tenantPropertyIdx: index('bookings_tenant_property_idx').on(table.tenantId, table.propertyId),
  statusIdx: index('bookings_status_idx').on(table.status),
  checkInDateIdx: index('bookings_check_in_date_idx').on(table.checkInDate),
  guestIdx: index('bookings_guest_idx').on(table.guestId),
  referenceIdx: uniqueIndex('bookings_reference_idx').on(table.referenceNumber),
  
  // Composite indexes for complex queries
  tenantPropertyDatesIdx: index('bookings_tenant_property_dates_idx').on(
    table.tenantId, 
    table.propertyId, 
    table.checkInDate, 
    table.checkOutDate
  ),
}));

/**
 * Booking Rooms Table
 * 
 * Many-to-many relationship between bookings and room types.
 * Stores denormalized pricing for historical accuracy.
 */
export const bookingRooms = pgTable('booking_rooms', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Foreign Keys
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  roomTypeId: uuid('room_type_id').notNull(),
  
  // Room Details
  roomTypeName: varchar('room_type_name', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  
  // Pricing (denormalized for historical accuracy)
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  
  // Rate Plan
  ratePlanId: uuid('rate_plan_id'),
  ratePlanName: varchar('rate_plan_name', { length: 100 }),
  
  // Audit Fields
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  bookingIdx: index('booking_rooms_booking_idx').on(table.bookingId),
  roomTypeIdx: index('booking_rooms_room_type_idx').on(table.roomTypeId),
}));

/**
 * Guests Table
 * 
 * Stores guest information with NDPR compliance fields.
 * Unique constraint on (tenantId, email) to prevent duplicates within tenant.
 */
export const guests = pgTable('guests', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Multi-Tenancy
  tenantId: uuid('tenant_id').notNull(),
  
  // Guest Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  // Phone format: +234XXXXXXXXXX
  
  // Address (optional)
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('Nigeria'),
  
  // NDPR Compliance
  ndprConsent: timestamp('ndpr_consent', { withTimezone: true }),
  ndprConsentIp: varchar('ndpr_consent_ip', { length: 45 }),
  marketingConsent: timestamp('marketing_consent', { withTimezone: true }),
  
  // Guest Preferences
  preferences: jsonb('preferences'),
  // Example: { language: 'en', dietaryRestrictions: ['vegetarian'], roomPreferences: ['non-smoking'] }
  
  // Audit Fields
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  
  // Soft Delete (NDPR right to deletion)
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  tenantEmailIdx: uniqueIndex('guests_tenant_email_idx').on(table.tenantId, table.email),
  phoneIdx: index('guests_phone_idx').on(table.phone),
  emailIdx: index('guests_email_idx').on(table.email),
}));

/**
 * Payments Table
 * 
 * Stores payment records with gateway-specific transaction IDs.
 * No card data stored (PCI DSS compliance via tokenization).
 */
export const payments = pgTable('payments', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Foreign Keys
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull(),
  
  // Payment Details
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  
  // Payment Gateway
  gateway: varchar('gateway', { length: 20 }).notNull(),
  // Gateway values: paystack, flutterwave, interswitch
  
  gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }),
  gatewayReference: varchar('gateway_reference', { length: 255 }),
  
  // Payment Status
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  // Status values: pending, processing, completed, failed, refunded
  
  // Payment Method
  paymentMethod: varchar('payment_method', { length: 50 }),
  // Payment method values: card, bank_transfer, ussd, mobile_money
  
  // Card Info (last 4 digits only, no full card data)
  cardLast4: varchar('card_last4', { length: 4 }),
  cardBrand: varchar('card_brand', { length: 20 }),
  
  // Payment Metadata
  metadata: jsonb('metadata'),
  
  // Refund Information
  refundedAmount: decimal('refunded_amount', { precision: 12, scale: 2 }),
  refundedAt: timestamp('refunded_at', { withTimezone: true }),
  
  // Audit Fields
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  bookingIdx: index('payments_booking_idx').on(table.bookingId),
  tenantIdx: index('payments_tenant_idx').on(table.tenantId),
  statusIdx: index('payments_status_idx').on(table.status),
  gatewayRefIdx: index('payments_gateway_ref_idx').on(table.gatewayReference),
}));

/**
 * Booking Events Table
 * 
 * Audit trail for all booking state changes.
 * Stores event data in JSONB for flexibility.
 */
export const bookingEvents = pgTable('booking_events', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Foreign Keys
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull(),
  
  // Event Details
  eventType: varchar('event_type', { length: 50 }).notNull(),
  // Event types: booking.created, booking.modified, booking.cancelled, payment.completed, booking.synced
  
  eventData: jsonb('event_data').notNull(),
  // Flexible event data storage
  
  // Actor
  actorId: uuid('actor_id'),
  actorType: varchar('actor_type', { length: 20 }),
  // Actor types: guest, staff, system
  
  // Timestamp
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  bookingIdx: index('booking_events_booking_idx').on(table.bookingId),
  eventTypeIdx: index('booking_events_event_type_idx').on(table.eventType),
  occurredAtIdx: index('booking_events_occurred_at_idx').on(table.occurredAt),
}));

/**
 * Offline Sync Queue Table
 * 
 * Stores offline bookings for background sync.
 * Used by offline sync engine to queue and retry failed syncs.
 */
export const offlineSyncQueue = pgTable('offline_sync_queue', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Tenant
  tenantId: uuid('tenant_id').notNull(),
  
  // Sync Item
  itemType: varchar('item_type', { length: 50 }).notNull(),
  // Item types: booking, payment, guest
  
  itemData: jsonb('item_data').notNull(),
  // Complete item data for sync
  
  // Sync Status
  syncStatus: varchar('sync_status', { length: 20 }).notNull().default('pending'),
  // Status values: pending, syncing, synced, conflict, failed
  
  // Retry Logic
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(5),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  
  // Error Information
  lastError: text('last_error'),
  
  // Conflict Resolution
  conflictData: jsonb('conflict_data'),
  conflictResolution: varchar('conflict_resolution', { length: 20 }),
  // Resolution values: server_wins, client_wins, manual
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  syncedAt: timestamp('synced_at', { withTimezone: true }),
}, (table) => ({
  tenantIdx: index('offline_sync_queue_tenant_idx').on(table.tenantId),
  statusIdx: index('offline_sync_queue_status_idx').on(table.syncStatus),
  nextRetryIdx: index('offline_sync_queue_next_retry_idx').on(table.nextRetryAt),
}));

/**
 * Drizzle Relations
 * 
 * Defines relationships between tables for query building.
 */
export const bookingsRelations = relations(bookings, ({ many, one }) => ({
  bookingRooms: many(bookingRooms),
  payments: many(payments),
  events: many(bookingEvents),
  guest: one(guests, {
    fields: [bookings.guestId],
    references: [guests.id],
  }),
}));

export const bookingRoomsRelations = relations(bookingRooms, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingRooms.bookingId],
    references: [bookings.id],
  }),
}));

export const guestsRelations = relations(guests, ({ many }) => ({
  bookings: many(bookings),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const bookingEventsRelations = relations(bookingEvents, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingEvents.bookingId],
    references: [bookings.id],
  }),
}));

/**
 * Type Exports
 * 
 * Export TypeScript types inferred from schema for type safety.
 */
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type BookingRoom = typeof bookingRooms.$inferSelect;
export type NewBookingRoom = typeof bookingRooms.$inferInsert;

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type BookingEvent = typeof bookingEvents.$inferSelect;
export type NewBookingEvent = typeof bookingEvents.$inferInsert;

export type OfflineSyncQueueItem = typeof offlineSyncQueue.$inferSelect;
export type NewOfflineSyncQueueItem = typeof offlineSyncQueue.$inferInsert;
