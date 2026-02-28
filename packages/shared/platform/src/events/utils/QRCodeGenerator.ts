export class QRCodeGenerator {
  /**
   * Generate a unique QR code for event registration
   */
  static generateQRCode(eventId: string, memberId: string, registrationId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `EVT-${eventId.substring(0, 8)}-${memberId.substring(0, 8)}-${random}-${timestamp}`;
  }

  /**
   * Validate QR code format
   */
  static validateQRCode(qrCode: string): boolean {
    const pattern = /^EVT-[A-Za-z0-9]{8}-[A-Za-z0-9]{8}-[A-Z0-9]{6}-\d+$/;
    return pattern.test(qrCode);
  }

  /**
   * Extract event ID from QR code
   */
  static extractEventId(qrCode: string): string | null {
    if (!this.validateQRCode(qrCode)) return null;
    const parts = qrCode.split('-');
    return parts[1] || null;
  }

  /**
   * Extract member ID from QR code
   */
  static extractMemberId(qrCode: string): string | null {
    if (!this.validateQRCode(qrCode)) return null;
    const parts = qrCode.split('-');
    return parts[2] || null;
  }
}
