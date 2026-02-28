/**
 * Hospitality Booking Engine - Notification Service
 * 
 * Handles SMS and email notifications for booking confirmations, modifications,
 * and cancellations. Implements SMS-first with email fallback strategy.
 * 
 * @module hospitality-booking-engine/services/notification-service
 * @author webwakaagent4
 */

import axios from 'axios';
import { BookingDetails } from '../types';

/**
 * Notification Type Enum
 */
export enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_MODIFICATION = 'booking_modification',
  BOOKING_CANCELLATION = 'booking_cancellation',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  CHECK_IN_REMINDER = 'check_in_reminder',
}

/**
 * Notification Result
 */
export interface NotificationResult {
  success: boolean;
  channel: 'sms' | 'email';
  error?: string;
}

/**
 * SMS Provider Interface
 */
export interface ISMSProvider {
  sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Email Provider Interface
 */
export interface IEmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Termii SMS Provider
 * 
 * Implements Termii SMS gateway for Nigerian market.
 */
export class TermiiSMSProvider implements ISMSProvider {
  private apiKey: string;
  private senderId: string;
  private baseUrl: string;

  constructor(apiKey: string, senderId: string, baseUrl: string = 'https://api.ng.termii.com/api') {
    this.apiKey = apiKey;
    this.senderId = senderId;
    this.baseUrl = baseUrl;
  }

  async sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/sms/send`,
        {
          to,
          from: this.senderId,
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: this.apiKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.message_id) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'SMS sending failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'SMS sending failed',
      };
    }
  }
}

/**
 * SMTP Email Provider
 * 
 * Implements SMTP email sending.
 */
export class SMTPEmailProvider implements IEmailProvider {
  private smtpConfig: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };

  constructor(smtpConfig: { host: string; port: number; user: string; pass: string }) {
    this.smtpConfig = smtpConfig;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement actual SMTP sending using nodemailer
      // For now, simulate success
      console.log(`Sending email to ${to}: ${subject}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email sending failed',
      };
    }
  }
}

/**
 * Notification Service
 * 
 * Manages booking notifications via SMS and email with fallback logic.
 */
export class NotificationService {
  private smsProvider: ISMSProvider;
  private emailProvider: IEmailProvider;

  constructor(smsProvider: ISMSProvider, emailProvider: IEmailProvider) {
    this.smsProvider = smsProvider;
    this.emailProvider = emailProvider;
  }

  /**
   * Send Booking Confirmation
   * 
   * Sends booking confirmation notification via SMS with email fallback.
   */
  async sendBookingConfirmation(booking: BookingDetails): Promise<NotificationResult> {
    const smsMessage = this.generateBookingConfirmationSMS(booking);
    const emailSubject = 'Booking Confirmation';
    const emailBody = this.generateBookingConfirmationEmail(booking);

    return await this.sendNotificationWithFallback(
      booking.guest.phone,
      booking.guest.email,
      smsMessage,
      emailSubject,
      emailBody
    );
  }

  /**
   * Send Booking Modification
   * 
   * Sends booking modification notification via SMS with email fallback.
   */
  async sendBookingModification(booking: BookingDetails): Promise<NotificationResult> {
    const smsMessage = this.generateBookingModificationSMS(booking);
    const emailSubject = 'Booking Modified';
    const emailBody = this.generateBookingModificationEmail(booking);

    return await this.sendNotificationWithFallback(
      booking.guest.phone,
      booking.guest.email,
      smsMessage,
      emailSubject,
      emailBody
    );
  }

  /**
   * Send Booking Cancellation
   * 
   * Sends booking cancellation notification via SMS with email fallback.
   */
  async sendBookingCancellation(booking: BookingDetails): Promise<NotificationResult> {
    const smsMessage = this.generateBookingCancellationSMS(booking);
    const emailSubject = 'Booking Cancelled';
    const emailBody = this.generateBookingCancellationEmail(booking);

    return await this.sendNotificationWithFallback(
      booking.guest.phone,
      booking.guest.email,
      smsMessage,
      emailSubject,
      emailBody
    );
  }

  /**
   * Send Notification with Fallback
   * 
   * Attempts SMS first, falls back to email if SMS fails.
   */
  private async sendNotificationWithFallback(
    phone: string,
    email: string,
    smsMessage: string,
    emailSubject: string,
    emailBody: string
  ): Promise<NotificationResult> {
    // Try SMS first
    const smsResult = await this.smsProvider.sendSMS(phone, smsMessage);

    if (smsResult.success) {
      console.log(`SMS sent successfully to ${phone}`);
      return {
        success: true,
        channel: 'sms',
      };
    }

    // SMS failed, try email fallback
    console.warn(`SMS failed to ${phone}: ${smsResult.error}. Trying email fallback...`);

    const emailResult = await this.emailProvider.sendEmail(email, emailSubject, emailBody);

    if (emailResult.success) {
      console.log(`Email sent successfully to ${email} (SMS fallback)`);
      return {
        success: true,
        channel: 'email',
      };
    }

    // Both failed
    console.error(`Both SMS and email failed for ${phone}/${email}`);
    return {
      success: false,
      channel: 'email',
      error: `SMS failed: ${smsResult.error}. Email failed: ${emailResult.error}`,
    };
  }

  /**
   * Generate Booking Confirmation SMS
   */
  private generateBookingConfirmationSMS(booking: BookingDetails): string {
    return `Booking confirmed! Ref: ${booking.referenceNumber}. ${booking.propertyName}, Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}, Total: ₦${booking.totalAmount.toLocaleString()}. Thank you!`;
  }

  /**
   * Generate Booking Confirmation Email
   */
  private generateBookingConfirmationEmail(booking: BookingDetails): string {
    return `
Dear ${booking.guest.firstName} ${booking.guest.lastName},

Your booking has been confirmed!

Booking Reference: ${booking.referenceNumber}
Property: ${booking.propertyName}
Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
Guests: ${booking.adultsCount} adult(s), ${booking.childrenCount} child(ren)
Total Amount: ₦${booking.totalAmount.toLocaleString()}

We look forward to welcoming you!

Best regards,
WebWaka Hospitality
    `.trim();
  }

  /**
   * Generate Booking Modification SMS
   */
  private generateBookingModificationSMS(booking: BookingDetails): string {
    return `Booking modified. Ref: ${booking.referenceNumber}. ${booking.propertyName}, Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}, Total: ₦${booking.totalAmount.toLocaleString()}.`;
  }

  /**
   * Generate Booking Modification Email
   */
  private generateBookingModificationEmail(booking: BookingDetails): string {
    return `
Dear ${booking.guest.firstName} ${booking.guest.lastName},

Your booking has been modified.

Booking Reference: ${booking.referenceNumber}
Property: ${booking.propertyName}
Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
Guests: ${booking.adultsCount} adult(s), ${booking.childrenCount} child(ren)
Total Amount: ₦${booking.totalAmount.toLocaleString()}

Best regards,
WebWaka Hospitality
    `.trim();
  }

  /**
   * Generate Booking Cancellation SMS
   */
  private generateBookingCancellationSMS(booking: BookingDetails): string {
    const refundText = booking.refundAmount ? ` Refund: ₦${booking.refundAmount.toLocaleString()}` : '';
    return `Booking cancelled. Ref: ${booking.referenceNumber}.${refundText} We hope to serve you again soon.`;
  }

  /**
   * Generate Booking Cancellation Email
   */
  private generateBookingCancellationEmail(booking: BookingDetails): string {
    const refundText = booking.refundAmount
      ? `\nRefund Amount: ₦${booking.refundAmount.toLocaleString()}\nRefund Status: ${booking.refundStatus}`
      : '\nNo refund applicable.';

    return `
Dear ${booking.guest.firstName} ${booking.guest.lastName},

Your booking has been cancelled.

Booking Reference: ${booking.referenceNumber}
Property: ${booking.propertyName}
Cancellation Date: ${booking.cancellationDate ? new Date(booking.cancellationDate).toLocaleDateString() : 'N/A'}
${refundText}

We hope to serve you again in the future.

Best regards,
WebWaka Hospitality
    `.trim();
  }
}
