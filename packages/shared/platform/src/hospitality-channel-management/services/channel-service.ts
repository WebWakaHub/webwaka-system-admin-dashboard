/**
 * Channel Management Service
 * 
 * Core business logic for channel management operations
 * 
 * @author webwakaagent4
 * @step 438
 */

import { db } from '../database/connection';
import { channelConnections, channelMappings, distributionLogs, rateParityTracking, channelBookings } from '../database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateChannelConnectionDTO,
  CreateChannelMappingDTO,
  DistributeInventoryDTO,
  DistributeRatesDTO,
  DistributeAvailabilityDTO,
  PullBookingsDTO,
  ChannelConnectionResponse,
  RateParityCheck,
  ChannelType,
} from '../types';
import { getChannelAdapter } from '../adapters/channel-adapter-factory';
import { EventPublisher } from '../events/event-publisher';

export class ChannelService {
  private eventPublisher: EventPublisher;

  constructor() {
    this.eventPublisher = new EventPublisher();
  }

  /**
   * Create a new channel connection
   */
  async createConnection(dto: CreateChannelConnectionDTO): Promise<ChannelConnectionResponse> {
    // Validate credentials by testing connection
    const adapter = getChannelAdapter(dto.channelType);
    await adapter.connect(dto.credentials);
    const isConnected = await adapter.testConnection();

    if (!isConnected) {
      throw new Error('Failed to establish connection with channel');
    }

    // Encrypt credentials before storing
    const encryptedCredentials = this.encryptCredentials(dto.credentials);

    // Create connection record
    const [connection] = await db.insert(channelConnections).values({
      id: uuidv4(),
      tenantId: dto.tenantId,
      propertyId: dto.propertyId,
      channelType: dto.channelType,
      channelName: dto.channelName,
      status: 'active',
      authType: dto.authType,
      credentials: encryptedCredentials,
      config: dto.config,
      commissionRate: dto.commissionRate?.toString(),
      lastSyncAt: new Date(),
    }).returning();

    // Publish event
    await this.eventPublisher.publishChannelConnectionCreated({
      connectionId: connection.id,
      channelType: dto.channelType,
      propertyId: dto.propertyId,
      tenantId: dto.tenantId,
    });

    return {
      connectionId: connection.id,
      channelType: connection.channelType as ChannelType,
      channelName: connection.channelName,
      status: connection.status as any,
      lastSyncAt: connection.lastSyncAt?.toISOString(),
      createdAt: connection.createdAt.toISOString(),
    };
  }

  /**
   * Create room type mapping
   */
  async createMapping(dto: CreateChannelMappingDTO): Promise<void> {
    await db.insert(channelMappings).values({
      id: uuidv4(),
      connectionId: dto.connectionId,
      internalRoomTypeId: dto.internalRoomTypeId,
      channelRoomTypeId: dto.channelRoomTypeId,
      channelRoomTypeName: dto.channelRoomTypeName,
      priceModifier: dto.priceModifier?.toString() || '1.00',
      availabilityOffset: dto.availabilityOffset || 0,
    });
  }

  /**
   * Distribute inventory to a channel
   */
  async distributeInventory(dto: DistributeInventoryDTO): Promise<void> {
    const logId = uuidv4();

    try {
      // Get connection details
      const [connection] = await db
        .select()
        .from(channelConnections)
        .where(eq(channelConnections.id, dto.connectionId))
        .limit(1);

      if (!connection) {
        throw new Error('Channel connection not found');
      }

      // Create distribution log
      await db.insert(distributionLogs).values({
        id: logId,
        connectionId: dto.connectionId,
        operationType: 'inventory',
        direction: 'push',
        payload: dto,
        status: 'pending',
        startedAt: new Date(),
      });

      // Get channel adapter
      const adapter = getChannelAdapter(connection.channelType as ChannelType);
      await adapter.connect(this.decryptCredentials(connection.credentials));

      // Push inventory
      await adapter.pushInventory(dto.roomTypes);

      // Update log as success
      await db
        .update(distributionLogs)
        .set({
          status: 'success',
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      // Update last sync time
      await db
        .update(channelConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(channelConnections.id, dto.connectionId));

      // Publish event
      await this.eventPublisher.publishInventoryDistributed({
        connectionId: dto.connectionId,
        roomTypeCount: dto.roomTypes.length,
        status: 'success',
        tenantId: connection.tenantId,
      });
    } catch (error) {
      // Update log as failed
      await db
        .update(distributionLogs)
        .set({
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      throw error;
    }
  }

  /**
   * Distribute rates to a channel
   */
  async distributeRates(dto: DistributeRatesDTO): Promise<void> {
    const logId = uuidv4();

    try {
      const [connection] = await db
        .select()
        .from(channelConnections)
        .where(eq(channelConnections.id, dto.connectionId))
        .limit(1);

      if (!connection) {
        throw new Error('Channel connection not found');
      }

      await db.insert(distributionLogs).values({
        id: logId,
        connectionId: dto.connectionId,
        operationType: 'rate',
        direction: 'push',
        payload: dto,
        status: 'pending',
        startedAt: new Date(),
      });

      const adapter = getChannelAdapter(connection.channelType as ChannelType);
      await adapter.connect(this.decryptCredentials(connection.credentials));

      // Apply price modifiers from mappings
      const modifiedRates = await this.applyPriceModifiers(dto.connectionId, dto.rates);

      await adapter.pushRates(modifiedRates);

      await db
        .update(distributionLogs)
        .set({
          status: 'success',
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      await db
        .update(channelConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(channelConnections.id, dto.connectionId));
    } catch (error) {
      await db
        .update(distributionLogs)
        .set({
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      throw error;
    }
  }

  /**
   * Distribute availability to a channel
   */
  async distributeAvailability(dto: DistributeAvailabilityDTO): Promise<void> {
    const logId = uuidv4();

    try {
      const [connection] = await db
        .select()
        .from(channelConnections)
        .where(eq(channelConnections.id, dto.connectionId))
        .limit(1);

      if (!connection) {
        throw new Error('Channel connection not found');
      }

      await db.insert(distributionLogs).values({
        id: logId,
        connectionId: dto.connectionId,
        operationType: 'availability',
        direction: 'push',
        payload: dto,
        status: 'pending',
        startedAt: new Date(),
      });

      const adapter = getChannelAdapter(connection.channelType as ChannelType);
      await adapter.connect(this.decryptCredentials(connection.credentials));

      // Apply availability offsets from mappings
      const modifiedAvailability = await this.applyAvailabilityOffsets(dto.connectionId, dto.availability);

      await adapter.pushAvailability(modifiedAvailability);

      await db
        .update(distributionLogs)
        .set({
          status: 'success',
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      await db
        .update(channelConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(channelConnections.id, dto.connectionId));
    } catch (error) {
      await db
        .update(distributionLogs)
        .set({
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      throw error;
    }
  }

  /**
   * Pull bookings from a channel
   */
  async pullBookings(dto: PullBookingsDTO): Promise<void> {
    const logId = uuidv4();

    try {
      const [connection] = await db
        .select()
        .from(channelConnections)
        .where(eq(channelConnections.id, dto.connectionId))
        .limit(1);

      if (!connection) {
        throw new Error('Channel connection not found');
      }

      await db.insert(distributionLogs).values({
        id: logId,
        connectionId: dto.connectionId,
        operationType: 'booking',
        direction: 'pull',
        payload: dto,
        status: 'pending',
        startedAt: new Date(),
      });

      const adapter = getChannelAdapter(connection.channelType as ChannelType);
      await adapter.connect(this.decryptCredentials(connection.credentials));

      const bookings = await adapter.pullBookings(dto.startDate, dto.endDate);

      // Store bookings
      for (const booking of bookings) {
        await db.insert(channelBookings).values({
          id: uuidv4(),
          connectionId: dto.connectionId,
          channelBookingId: booking.channelBookingId,
          propertyId: booking.propertyId,
          roomTypeId: booking.roomTypeId,
          checkInDate: new Date(booking.checkInDate),
          checkOutDate: new Date(booking.checkOutDate),
          guestInfo: booking.guestInfo,
          totalAmount: booking.totalAmount.toString(),
          currency: booking.currency,
          commissionAmount: booking.commissionAmount?.toString(),
          status: booking.status,
          syncStatus: 'pending',
        });

        // Publish event
        await this.eventPublisher.publishBookingReceived({
          connectionId: dto.connectionId,
          channelBookingId: booking.channelBookingId,
          propertyId: booking.propertyId,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          totalAmount: booking.totalAmount,
          tenantId: connection.tenantId,
        });
      }

      await db
        .update(distributionLogs)
        .set({
          status: 'success',
          response: { bookingsCount: bookings.length },
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      await db
        .update(channelConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(channelConnections.id, dto.connectionId));
    } catch (error) {
      await db
        .update(distributionLogs)
        .set({
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(distributionLogs.id, logId));

      throw error;
    }
  }

  /**
   * Check rate parity across channels
   */
  async checkRateParity(propertyId: string, roomTypeId: string, date: string): Promise<RateParityCheck> {
    // Get all active connections for property
    const connections = await db
      .select()
      .from(channelConnections)
      .where(
        and(
          eq(channelConnections.propertyId, propertyId),
          eq(channelConnections.status, 'active')
        )
      );

    // Collect rates from all channels
    const rates: Record<string, number> = {};
    
    for (const connection of connections) {
      // In real implementation, would query each channel's API
      // For now, using placeholder logic
      rates[connection.channelType] = 25000; // Placeholder
    }

    // Calculate parity
    const rateValues = Object.values(rates);
    const minRate = Math.min(...rateValues);
    const maxRate = Math.max(...rateValues);
    const rateVariance = maxRate - minRate;
    const variancePercentage = (rateVariance / minRate) * 100;

    let parityStatus: 'compliant' | 'violation' | 'warning' = 'compliant';
    const violations: any[] = [];

    if (variancePercentage > 5) {
      parityStatus = 'violation';
      
      // Identify violations
      for (const [channel, rate] of Object.entries(rates)) {
        if (rate > minRate) {
          violations.push({
            channel,
            rate,
            baseRate: minRate,
            difference: rate - minRate,
            differencePercentage: ((rate - minRate) / minRate) * 100,
          });
        }
      }

      // Publish violation event
      await this.eventPublisher.publishRateParityViolation({
        propertyId,
        roomTypeId,
        date,
        violations,
        tenantId: connections[0].tenantId,
      });
    } else if (variancePercentage > 2) {
      parityStatus = 'warning';
    }

    // Store parity check result
    await db.insert(rateParityTracking).values({
      id: uuidv4(),
      propertyId,
      roomTypeId,
      date: new Date(date),
      rates,
      parityStatus,
      violationDetails: violations.length > 0 ? violations : null,
    });

    return {
      propertyId,
      roomTypeId,
      date,
      rates,
      parityStatus,
      violationDetails: violations,
    };
  }

  /**
   * Apply price modifiers from mappings
   */
  private async applyPriceModifiers(connectionId: string, rates: any[]): Promise<any[]> {
    const mappings = await db
      .select()
      .from(channelMappings)
      .where(eq(channelMappings.connectionId, connectionId));

    const mappingMap = new Map(
      mappings.map(m => [m.internalRoomTypeId, parseFloat(m.priceModifier || '1.00')])
    );

    return rates.map(rate => ({
      ...rate,
      basePrice: rate.basePrice * (mappingMap.get(rate.internalRoomTypeId) || 1.0),
    }));
  }

  /**
   * Apply availability offsets from mappings
   */
  private async applyAvailabilityOffsets(connectionId: string, availability: any[]): Promise<any[]> {
    const mappings = await db
      .select()
      .from(channelMappings)
      .where(eq(channelMappings.connectionId, connectionId));

    const mappingMap = new Map(
      mappings.map(m => [m.internalRoomTypeId, m.availabilityOffset || 0])
    );

    return availability.map(avail => ({
      ...avail,
      availableCount: Math.max(0, avail.availableCount - (mappingMap.get(avail.internalRoomTypeId) || 0)),
    }));
  }

  /**
   * Encrypt credentials (placeholder - use proper encryption in production)
   */
  private encryptCredentials(credentials: any): any {
    // In production, use proper encryption (e.g., AWS KMS, Azure Key Vault)
    return credentials;
  }

  /**
   * Decrypt credentials (placeholder - use proper decryption in production)
   */
  private decryptCredentials(credentials: any): any {
    // In production, use proper decryption
    return credentials;
  }
}
