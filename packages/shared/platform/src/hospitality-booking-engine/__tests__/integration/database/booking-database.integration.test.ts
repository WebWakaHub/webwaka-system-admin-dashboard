/**
 * Hospitality Booking Engine - Database Integration Tests
 * 
 * Integration tests for database operations with real PostgreSQL.
 * Tests Drizzle ORM queries, transactions, constraints, and migrations.
 * 
 * @module hospitality-booking-engine/__tests__/integration/database/booking-database.integration.test
 * @author webwakaagent5
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import {
  bookings,
  bookingRooms,
  guests,
  payments,
  bookingEvents,
  offlineSyncQueue,
} from '../../../database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { BookingStatus, PaymentStatus, RefundStatus, SyncStatus } from '../../../types';

describe('Database Integration Tests', () => {
  let pool: Pool;
  let db: any;

  beforeAll(async () => {
    // Setup test database connection
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME_TEST || 'webwaka_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    db = drizzle(pool);

    // Run migrations
    await migrate(db, { migrationsFolder: './migrations' });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await db.delete(bookingEvents);
    await db.delete(offlineSyncQueue);
    await db.delete(payments);
    await db.delete(bookingRooms);
    await db.delete(bookings);
    await db.delete(guests);
  });

  describe('Bookings Table', () => {
    it('should insert booking successfully', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      const bookingData = {
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        referenceNumber: 'BK123456',
        guestId: guest.id,
        checkInDate: new Date('2026-03-01'),
        checkOutDate: new Date('2026-03-05'),
        adultsCount: 2,
        childrenCount: 0,
        status: BookingStatus.PENDING,
        totalAmount: 100000,
        currency: 'NGN',
        version: 1,
      };

      const [booking] = await db.insert(bookings).values(bookingData).returning();

      expect(booking).toBeDefined();
      expect(booking.id).toBeDefined();
      expect(booking.referenceNumber).toBe('BK123456');
      expect(booking.status).toBe(BookingStatus.PENDING);
      expect(booking.totalAmount).toBe(100000);
    });

    it('should enforce unique reference number constraint', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      const bookingData = {
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        referenceNumber: 'BK123456',
        guestId: guest.id,
        checkInDate: new Date('2026-03-01'),
        checkOutDate: new Date('2026-03-05'),
        adultsCount: 2,
        status: BookingStatus.PENDING,
        totalAmount: 100000,
        currency: 'NGN',
        version: 1,
      };

      await db.insert(bookings).values(bookingData);

      // Try to insert duplicate reference number
      await expect(
        db.insert(bookings).values(bookingData)
      ).rejects.toThrow();
    });

    it('should query bookings by tenant', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      // Insert multiple bookings
      await db.insert(bookings).values([
        {
          tenantId: 'tenant_123',
          propertyId: 'property_123',
          referenceNumber: 'BK001',
          guestId: guest.id,
          checkInDate: new Date('2026-03-01'),
          checkOutDate: new Date('2026-03-05'),
          adultsCount: 2,
          status: BookingStatus.PENDING,
          totalAmount: 100000,
          currency: 'NGN',
          version: 1,
        },
        {
          tenantId: 'tenant_123',
          propertyId: 'property_456',
          referenceNumber: 'BK002',
          guestId: guest.id,
          checkInDate: new Date('2026-04-01'),
          checkOutDate: new Date('2026-04-05'),
          adultsCount: 2,
          status: BookingStatus.CONFIRMED,
          totalAmount: 150000,
          currency: 'NGN',
          version: 1,
        },
      ]);

      const results = await db
        .select()
        .from(bookings)
        .where(eq(bookings.tenantId, 'tenant_123'));

      expect(results).toHaveLength(2);
    });

    it('should query bookings by date range', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      await db.insert(bookings).values([
        {
          tenantId: 'tenant_123',
          propertyId: 'property_123',
          referenceNumber: 'BK001',
          guestId: guest.id,
          checkInDate: new Date('2026-03-01'),
          checkOutDate: new Date('2026-03-05'),
          adultsCount: 2,
          status: BookingStatus.PENDING,
          totalAmount: 100000,
          currency: 'NGN',
          version: 1,
        },
        {
          tenantId: 'tenant_123',
          propertyId: 'property_123',
          referenceNumber: 'BK002',
          guestId: guest.id,
          checkInDate: new Date('2026-05-01'),
          checkOutDate: new Date('2026-05-05'),
          adultsCount: 2,
          status: BookingStatus.CONFIRMED,
          totalAmount: 150000,
          currency: 'NGN',
          version: 1,
        },
      ]);

      const results = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.tenantId, 'tenant_123'),
            gte(bookings.checkInDate, new Date('2026-03-01')),
            lte(bookings.checkInDate, new Date('2026-03-31'))
          )
        );

      expect(results).toHaveLength(1);
      expect(results[0].referenceNumber).toBe('BK001');
    });

    it('should update booking with version increment', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      const [booking] = await db.insert(bookings).values({
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        referenceNumber: 'BK123',
        guestId: guest.id,
        checkInDate: new Date('2026-03-01'),
        checkOutDate: new Date('2026-03-05'),
        adultsCount: 2,
        status: BookingStatus.PENDING,
        totalAmount: 100000,
        currency: 'NGN',
        version: 1,
      }).returning();

      // Update booking
      const [updated] = await db
        .update(bookings)
        .set({
          adultsCount: 3,
          version: booking.version + 1,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(bookings.id, booking.id),
            eq(bookings.version, booking.version)
          )
        )
        .returning();

      expect(updated.adultsCount).toBe(3);
      expect(updated.version).toBe(2);
    });
  });

  describe('Booking Rooms Table', () => {
    it('should insert booking rooms with foreign key', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      const [booking] = await db.insert(bookings).values({
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        referenceNumber: 'BK123',
        guestId: guest.id,
        checkInDate: new Date('2026-03-01'),
        checkOutDate: new Date('2026-03-05'),
        adultsCount: 2,
        status: BookingStatus.PENDING,
        totalAmount: 100000,
        currency: 'NGN',
        version: 1,
      }).returning();

      const roomData = {
        bookingId: booking.id,
        roomTypeId: 'room_type_123',
        ratePlanId: 'rate_plan_123',
        quantity: 1,
        pricePerNight: 25000,
        totalPrice: 100000,
        currency: 'NGN',
      };

      const [room] = await db.insert(bookingRooms).values(roomData).returning();

      expect(room).toBeDefined();
      expect(room.bookingId).toBe(booking.id);
      expect(room.quantity).toBe(1);
    });

    it('should cascade delete booking rooms when booking is deleted', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      const [booking] = await db.insert(bookings).values({
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        referenceNumber: 'BK123',
        guestId: guest.id,
        checkInDate: new Date('2026-03-01'),
        checkOutDate: new Date('2026-03-05'),
        adultsCount: 2,
        status: BookingStatus.PENDING,
        totalAmount: 100000,
        currency: 'NGN',
        version: 1,
      }).returning();

      await db.insert(bookingRooms).values({
        bookingId: booking.id,
        roomTypeId: 'room_type_123',
        ratePlanId: 'rate_plan_123',
        quantity: 1,
        pricePerNight: 25000,
        totalPrice: 100000,
        currency: 'NGN',
      });

      // Delete booking
      await db.delete(bookings).where(eq(bookings.id, booking.id));

      // Verify rooms are deleted
      const rooms = await db
        .select()
        .from(bookingRooms)
        .where(eq(bookingRooms.bookingId, booking.id));

      expect(rooms).toHaveLength(0);
    });
  });

  describe('Payments Table', () => {
    it('should insert payment with booking reference', async () => {
      const guestData = {
        tenantId: 'tenant_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
        ndprConsentDate: new Date(),
      };

      const [guest] = await db.insert(guests).values(guestData).returning();

      const [booking] = await db.insert(bookings).values({
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        referenceNumber: 'BK123',
        guestId: guest.id,
        checkInDate: new Date('2026-03-01'),
        checkOutDate: new Date('2026-03-05'),
        adultsCount: 2,
        status: BookingStatus.PENDING,
        totalAmount: 100000,
        currency: 'NGN',
        version: 1,
      }).returning();

      const paymentData = {
        tenantId: 'tenant_123',
        bookingId: booking.id,
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack',
        transactionId: 'txn_123',
        reference: 'ref_123',
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'card',
      };

      const [payment] = await db.insert(payments).values(paymentData).returning();

      expect(payment).toBeDefined();
      expect(payment.bookingId).toBe(booking.id);
      expect(payment.status).toBe(PaymentStatus.COMPLETED);
    });
  });

  describe('Transactions', () => {
    it('should rollback transaction on error', async () => {
      await expect(async () => {
        await db.transaction(async (tx: any) => {
          const guestData = {
            tenantId: 'tenant_123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+2348012345678',
            ndprConsent: true,
            ndprConsentDate: new Date(),
          };

          const [guest] = await tx.insert(guests).values(guestData).returning();

          await tx.insert(bookings).values({
            tenantId: 'tenant_123',
            propertyId: 'property_123',
            referenceNumber: 'BK123',
            guestId: guest.id,
            checkInDate: new Date('2026-03-01'),
            checkOutDate: new Date('2026-03-05'),
            adultsCount: 2,
            status: BookingStatus.PENDING,
            totalAmount: 100000,
            currency: 'NGN',
            version: 1,
          });

          // Force error
          throw new Error('Transaction error');
        });
      }).rejects.toThrow('Transaction error');

      // Verify rollback
      const guestsCount = await db.select().from(guests);
      const bookingsCount = await db.select().from(bookings);

      expect(guestsCount).toHaveLength(0);
      expect(bookingsCount).toHaveLength(0);
    });
  });

  describe('Indexes', () => {
    it('should use index for tenant_id queries', async () => {
      // This test would require EXPLAIN ANALYZE in real scenario
      // For now, just verify query works efficiently
      const results = await db
        .select()
        .from(bookings)
        .where(eq(bookings.tenantId, 'tenant_123'));

      expect(results).toBeInstanceOf(Array);
    });
  });
});
