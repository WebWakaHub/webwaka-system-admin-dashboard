/**
 * Channel Management Database Schema
 * 
 * Defines database tables for:
 * - Channel connections
 * - Channel mappings
 * - Distribution logs
 * - Rate parity tracking
 * 
 * @author webwakaagent4
 * @step 438
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, integer, boolean, index } from 'drizzle-orm/pg-core';

/**
 * Channel Connections Table
 * Stores OTA/channel connection configurations
 */
export const channelConnections = pgTable('channel_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  propertyId: uuid('property_id').notNull(),
  channelType: varchar('channel_type', { length: 50 }).notNull(), // 'booking_com', 'expedia', 'airbnb', 'hotels_com'
  channelName: varchar('channel_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'inactive', 'error'
  
  // Authentication
  authType: varchar('auth_type', { length: 50 }).notNull(), // 'oauth', 'api_key'
  credentials: jsonb('credentials').notNull(), // Encrypted credentials
  
  // Configuration
  config: jsonb('config').notNull(), // Channel-specific settings
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }), // e.g., 15.00 for 15%
  
  // Status tracking
  lastSyncAt: timestamp('last_sync_at'),
  lastError: text('last_error'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  tenantIdx: index('idx_channel_connections_tenant').on(table.tenantId),
  propertyIdx: index('idx_channel_connections_property').on(table.propertyId),
  statusIdx: index('idx_channel_connections_status').on(table.status),
}));

/**
 * Channel Mappings Table
 * Maps internal room types to channel-specific room types
 */
export const channelMappings = pgTable('channel_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id').notNull().references(() => channelConnections.id),
  internalRoomTypeId: uuid('internal_room_type_id').notNull(),
  channelRoomTypeId: varchar('channel_room_type_id', { length: 255 }).notNull(),
  channelRoomTypeName: varchar('channel_room_type_name', { length: 255 }).notNull(),
  
  // Mapping configuration
  priceModifier: decimal('price_modifier', { precision: 5, scale: 2 }).default('1.00'), // e.g., 1.10 for 10% markup
  availabilityOffset: integer('availability_offset').default(0), // Reserve X rooms from channel
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  connectionIdx: index('idx_channel_mappings_connection').on(table.connectionId),
  roomTypeIdx: index('idx_channel_mappings_room_type').on(table.internalRoomTypeId),
}));

/**
 * Distribution Logs Table
 * Tracks all distribution operations to channels
 */
export const distributionLogs = pgTable('distribution_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id').notNull().references(() => channelConnections.id),
  operationType: varchar('operation_type', { length: 50 }).notNull(), // 'inventory', 'rate', 'availability', 'booking'
  direction: varchar('direction', { length: 20 }).notNull(), // 'push', 'pull'
  
  // Operation details
  payload: jsonb('payload').notNull(),
  response: jsonb('response'),
  
  // Status
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'success', 'failed', 'retrying'
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  
  // Timing
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  connectionIdx: index('idx_distribution_logs_connection').on(table.connectionId),
  statusIdx: index('idx_distribution_logs_status').on(table.status),
  typeIdx: index('idx_distribution_logs_type').on(table.operationType),
  createdIdx: index('idx_distribution_logs_created').on(table.createdAt),
}));

/**
 * Rate Parity Tracking Table
 * Monitors rate parity across channels
 */
export const rateParityTracking = pgTable('rate_parity_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull(),
  roomTypeId: uuid('room_type_id').notNull(),
  date: timestamp('date').notNull(),
  
  // Rate data per channel
  rates: jsonb('rates').notNull(), // { "booking_com": 25000, "expedia": 26000, ... }
  
  // Parity status
  parityStatus: varchar('parity_status', { length: 20 }).notNull(), // 'compliant', 'violation', 'warning'
  violationDetails: jsonb('violation_details'), // Details of parity violations
  
  // Audit
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index('idx_rate_parity_property').on(table.propertyId),
  dateIdx: index('idx_rate_parity_date').on(table.date),
  statusIdx: index('idx_rate_parity_status').on(table.parityStatus),
}));

/**
 * Channel Bookings Table
 * Stores bookings received from channels
 */
export const channelBookings = pgTable('channel_bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id').notNull().references(() => channelConnections.id),
  channelBookingId: varchar('channel_booking_id', { length: 255 }).notNull(),
  internalBookingId: uuid('internal_booking_id'), // Reference to booking in booking engine
  
  // Booking details
  propertyId: uuid('property_id').notNull(),
  roomTypeId: uuid('room_type_id').notNull(),
  checkInDate: timestamp('check_in_date').notNull(),
  checkOutDate: timestamp('check_out_date').notNull(),
  
  // Guest info
  guestInfo: jsonb('guest_info').notNull(),
  
  // Financial
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }),
  
  // Status
  status: varchar('status', { length: 20 }).notNull(), // 'confirmed', 'cancelled', 'modified'
  syncStatus: varchar('sync_status', { length: 20 }).notNull().default('pending'), // 'pending', 'synced', 'failed'
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  connectionIdx: index('idx_channel_bookings_connection').on(table.connectionId),
  channelBookingIdx: index('idx_channel_bookings_channel_id').on(table.channelBookingId),
  propertyIdx: index('idx_channel_bookings_property').on(table.propertyId),
  statusIdx: index('idx_channel_bookings_status').on(table.status),
  syncStatusIdx: index('idx_channel_bookings_sync_status').on(table.syncStatus),
}));

/**
 * Type exports for TypeScript
 */
export type ChannelConnection = typeof channelConnections.$inferSelect;
export type NewChannelConnection = typeof channelConnections.$inferInsert;
export type ChannelMapping = typeof channelMappings.$inferSelect;
export type NewChannelMapping = typeof channelMappings.$inferInsert;
export type DistributionLog = typeof distributionLogs.$inferSelect;
export type NewDistributionLog = typeof distributionLogs.$inferInsert;
export type RateParityTracking = typeof rateParityTracking.$inferSelect;
export type NewRateParityTracking = typeof rateParityTracking.$inferInsert;
export type ChannelBooking = typeof channelBookings.$inferSelect;
export type NewChannelBooking = typeof channelBookings.$inferInsert;
