/**
 * Guest Management Service
 * 
 * @author webwakaagent4
 * @step 447
 */

import { db } from '../database/connection';
import { guests, guestPreferences, guestCommunications, guestFeedback, loyaltyTransactions } from '../database/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateGuestDTO,
  UpdateGuestDTO,
  CreateGuestPreferencesDTO,
  SendCommunicationDTO,
  CreateFeedbackDTO,
  RespondToFeedbackDTO,
  EarnLoyaltyPointsDTO,
  RedeemLoyaltyPointsDTO,
  GuestResponse,
  GuestProfileResponse,
  LoyaltyTier,
} from '../types';
import { EventPublisher } from '../events/event-publisher';

export class GuestService {
  private eventPublisher: EventPublisher;

  constructor() {
    this.eventPublisher = new EventPublisher();
  }

  /**
   * Create a new guest
   */
  async createGuest(dto: CreateGuestDTO): Promise<GuestResponse> {
    // Validate phone format (+234)
    if (!dto.phone.startsWith('+234')) {
      throw new Error('Phone number must be in Nigerian format (+234)');
    }

    // Validate email format
    if (!this.isValidEmail(dto.email)) {
      throw new Error('Invalid email format');
    }

    // Check for duplicate email/phone
    const existing = await db
      .select()
      .from(guests)
      .where(
        and(
          eq(guests.tenantId, dto.tenantId),
          eq(guests.email, dto.email)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Guest with this email already exists');
    }

    // Create guest
    const [guest] = await db.insert(guests).values({
      id: uuidv4(),
      tenantId: dto.tenantId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      nationality: dto.nationality,
      address: dto.address,
      identityType: dto.identityType,
      identityNumber: dto.identityNumber,
      emergencyContact: dto.emergencyContact,
      specialRequirements: dto.specialRequirements,
      consentGiven: dto.consentGiven,
      consentDate: dto.consentGiven ? new Date() : null,
      status: 'active',
      loyaltyTier: 'bronze',
      loyaltyPoints: 0,
    }).returning();

    // Publish event
    await this.eventPublisher.publishGuestCreated({
      guestId: guest.id,
      email: guest.email,
      phone: guest.phone,
      tenantId: guest.tenantId,
    });

    return this.mapToGuestResponse(guest);
  }

  /**
   * Update guest profile
   */
  async updateGuest(guestId: string, dto: UpdateGuestDTO): Promise<GuestResponse> {
    const [updated] = await db
      .update(guests)
      .set({
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(guests.id, guestId))
      .returning();

    if (!updated) {
      throw new Error('Guest not found');
    }

    return this.mapToGuestResponse(updated);
  }

  /**
   * Get guest profile
   */
  async getGuestProfile(guestId: string): Promise<GuestProfileResponse> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.id, guestId))
      .limit(1);

    if (!guest) {
      throw new Error('Guest not found');
    }

    // Get preferences
    const [prefs] = await db
      .select()
      .from(guestPreferences)
      .where(eq(guestPreferences.guestId, guestId))
      .limit(1);

    return {
      ...this.mapToGuestResponse(guest),
      dateOfBirth: guest.dateOfBirth?.toISOString(),
      nationality: guest.nationality || undefined,
      address: guest.address as any,
      identityType: guest.identityType as any,
      identityVerified: guest.identityVerified || false,
      profilePhoto: guest.profilePhoto || undefined,
      bio: guest.bio || undefined,
      emergencyContact: guest.emergencyContact as any,
      specialRequirements: guest.specialRequirements as any,
      preferences: prefs ? {
        roomPreferences: prefs.roomPreferences as any,
        amenityPreferences: prefs.amenityPreferences as any,
        servicePreferences: prefs.servicePreferences as any,
        communicationPreferences: prefs.communicationPreferences as any,
        languagePreference: prefs.languagePreference || undefined,
        dietaryPreferences: prefs.dietaryPreferences as any,
        accessibilityRequirements: prefs.accessibilityRequirements as any,
      } : undefined,
    };
  }

  /**
   * Create or update guest preferences
   */
  async setGuestPreferences(dto: CreateGuestPreferencesDTO): Promise<void> {
    const existing = await db
      .select()
      .from(guestPreferences)
      .where(eq(guestPreferences.guestId, dto.guestId))
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(guestPreferences)
        .set({
          roomPreferences: dto.roomPreferences,
          amenityPreferences: dto.amenityPreferences,
          servicePreferences: dto.servicePreferences,
          communicationPreferences: dto.communicationPreferences,
          languagePreference: dto.languagePreference,
          dietaryPreferences: dto.dietaryPreferences,
          accessibilityRequirements: dto.accessibilityRequirements,
          updatedAt: new Date(),
        })
        .where(eq(guestPreferences.guestId, dto.guestId));
    } else {
      // Create
      await db.insert(guestPreferences).values({
        id: uuidv4(),
        guestId: dto.guestId,
        roomPreferences: dto.roomPreferences,
        amenityPreferences: dto.amenityPreferences,
        servicePreferences: dto.servicePreferences,
        communicationPreferences: dto.communicationPreferences,
        languagePreference: dto.languagePreference,
        dietaryPreferences: dto.dietaryPreferences,
        accessibilityRequirements: dto.accessibilityRequirements,
      });
    }
  }

  /**
   * Send communication to guest
   */
  async sendCommunication(dto: SendCommunicationDTO): Promise<void> {
    await db.insert(guestCommunications).values({
      id: uuidv4(),
      guestId: dto.guestId,
      tenantId: dto.tenantId,
      type: dto.type,
      direction: 'outbound',
      subject: dto.subject,
      content: dto.content,
      sentBy: dto.sentBy,
      sentAt: new Date(),
      deliveryStatus: 'pending',
      bookingId: dto.bookingId,
      propertyId: dto.propertyId,
    });

    // In production, integrate with Termii SMS, SendGrid, WhatsApp API
  }

  /**
   * Submit guest feedback
   */
  async submitFeedback(dto: CreateFeedbackDTO): Promise<void> {
    const feedbackId = uuidv4();

    await db.insert(guestFeedback).values({
      id: feedbackId,
      guestId: dto.guestId,
      tenantId: dto.tenantId,
      bookingId: dto.bookingId,
      propertyId: dto.propertyId,
      overallRating: dto.overallRating,
      cleanlinessRating: dto.cleanlinessRating,
      serviceRating: dto.serviceRating,
      valueRating: dto.valueRating,
      locationRating: dto.locationRating,
      amenitiesRating: dto.amenitiesRating,
      title: dto.title,
      comment: dto.comment,
      status: 'pending',
    });

    // Publish event
    await this.eventPublisher.publishFeedbackSubmitted({
      feedbackId,
      guestId: dto.guestId,
      propertyId: dto.propertyId,
      overallRating: dto.overallRating,
      tenantId: dto.tenantId,
    });
  }

  /**
   * Earn loyalty points
   */
  async earnLoyaltyPoints(dto: EarnLoyaltyPointsDTO): Promise<void> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.id, dto.guestId))
      .limit(1);

    if (!guest) {
      throw new Error('Guest not found');
    }

    const balanceBefore = guest.loyaltyPoints || 0;
    const balanceAfter = balanceBefore + dto.points;

    // Update guest points
    await db
      .update(guests)
      .set({
        loyaltyPoints: balanceAfter,
        loyaltyTier: this.calculateLoyaltyTier(balanceAfter),
      })
      .where(eq(guests.id, dto.guestId));

    // Record transaction
    await db.insert(loyaltyTransactions).values({
      id: uuidv4(),
      guestId: dto.guestId,
      tenantId: dto.tenantId,
      type: 'earn',
      points: dto.points,
      description: dto.description,
      bookingId: dto.bookingId,
      balanceBefore,
      balanceAfter,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    // Publish event
    await this.eventPublisher.publishLoyaltyPointsEarned({
      guestId: dto.guestId,
      points: dto.points,
      newBalance: balanceAfter,
      newTier: this.calculateLoyaltyTier(balanceAfter),
      tenantId: dto.tenantId,
    });
  }

  /**
   * Redeem loyalty points
   */
  async redeemLoyaltyPoints(dto: RedeemLoyaltyPointsDTO): Promise<void> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.id, dto.guestId))
      .limit(1);

    if (!guest) {
      throw new Error('Guest not found');
    }

    const balanceBefore = guest.loyaltyPoints || 0;

    if (balanceBefore < dto.points) {
      throw new Error('Insufficient loyalty points');
    }

    const balanceAfter = balanceBefore - dto.points;

    // Update guest points
    await db
      .update(guests)
      .set({
        loyaltyPoints: balanceAfter,
        loyaltyTier: this.calculateLoyaltyTier(balanceAfter),
      })
      .where(eq(guests.id, dto.guestId));

    // Record transaction
    await db.insert(loyaltyTransactions).values({
      id: uuidv4(),
      guestId: dto.guestId,
      tenantId: dto.tenantId,
      type: 'redeem',
      points: -dto.points,
      description: dto.description,
      bookingId: dto.bookingId,
      balanceBefore,
      balanceAfter,
    });
  }

  /**
   * Calculate loyalty tier based on points
   */
  private calculateLoyaltyTier(points: number): LoyaltyTier {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Map database guest to response
   */
  private mapToGuestResponse(guest: any): GuestResponse {
    return {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      status: guest.status,
      loyaltyTier: guest.loyaltyTier,
      loyaltyPoints: guest.loyaltyPoints || 0,
      vipStatus: guest.vipStatus || false,
      createdAt: guest.createdAt.toISOString(),
    };
  }
}
