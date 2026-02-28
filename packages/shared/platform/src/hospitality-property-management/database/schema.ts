/**
 * Property Management - Database Schema
 * 
 * Drizzle ORM schema for Property Management module.
 * 
 * @module hospitality-property-management/database/schema
 * @author webwakaagent4
 */

import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, jsonb, date, time, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Properties table
export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: varchar('tenant_id', { length: 255 }).notNull(),
  groupId: uuid('group_id'),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  address: jsonb('address').notNull(),
  contact: jsonb('contact').notNull(),
  checkInTime: time('check_in_time').notNull(),
  checkOutTime: time('check_out_time').notNull(),
  cancellationPolicy: varchar('cancellation_policy', { length: 50 }).notNull(),
  paymentPolicy: varchar('payment_policy', { length: 50 }).notNull(),
  houseRules: jsonb('house_rules'),
  status: varchar('status', { length: 50 }).notNull().default('inactive'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  version: integer('version').notNull().default(1),
}, (table) => ({
  tenantIdx: index('idx_properties_tenant_id').on(table.tenantId),
  statusIdx: index('idx_properties_status').on(table.status),
  tenantNameUnique: uniqueIndex('idx_properties_tenant_name').on(table.tenantId, table.name),
}));

// Room types table
export const roomTypes = pgTable('room_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  capacity: jsonb('capacity').notNull(),
  size: decimal('size', { precision: 10, scale: 2 }).notNull(),
  amenities: jsonb('amenities'),
  images: jsonb('images'),
  inventory: integer('inventory').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  propertyIdx: index('idx_room_types_property_id').on(table.propertyId),
  propertyNameUnique: uniqueIndex('idx_room_types_property_name').on(table.propertyId, table.name),
}));

// Rate plans table
export const ratePlans = pgTable('rate_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  roomTypeId: uuid('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  validFrom: date('valid_from').notNull(),
  validTo: date('valid_to').notNull(),
  dayOfWeekPricing: jsonb('day_of_week_pricing').notNull(),
  seasonalPricing: jsonb('seasonal_pricing'),
  occupancyPricing: jsonb('occupancy_pricing').notNull(),
  lengthOfStayDiscounts: jsonb('length_of_stay_discounts'),
  isPublic: boolean('is_public').notNull().default(true),
  accessCode: varchar('access_code', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  propertyIdx: index('idx_rate_plans_property_id').on(table.propertyId),
  roomTypeIdx: index('idx_rate_plans_room_type_id').on(table.roomTypeId),
  propertyNameUnique: uniqueIndex('idx_rate_plans_property_name').on(table.propertyId, table.name),
}));

// Availability table
export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  roomTypeId: uuid('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  inventory: integer('inventory').notNull().default(0),
  minimumStay: integer('minimum_stay').notNull().default(1),
  maximumStay: integer('maximum_stay').notNull().default(90),
  isStopSell: boolean('is_stop_sell').notNull().default(false),
  isBlocked: boolean('is_blocked').notNull().default(false),
  blockReason: text('block_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  propertyIdx: index('idx_availability_property_id').on(table.propertyId),
  roomTypeIdx: index('idx_availability_room_type_id').on(table.roomTypeId),
  dateIdx: index('idx_availability_date').on(table.date),
  propertyRoomDateUnique: uniqueIndex('idx_availability_property_room_date').on(table.propertyId, table.roomTypeId, table.date),
}));

// Property amenities table
export const propertyAmenities = pgTable('property_amenities', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  isFree: boolean('is_free').notNull().default(true),
  price: decimal('price', { precision: 10, scale: 2 }),
  operatingHours: jsonb('operating_hours'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  propertyIdx: index('idx_property_amenities_property_id').on(table.propertyId),
  propertyNameUnique: uniqueIndex('idx_property_amenities_property_name').on(table.propertyId, table.name),
}));
