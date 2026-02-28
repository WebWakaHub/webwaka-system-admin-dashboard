import { describe, it, expect } from 'vitest';
import { QRCodeGenerator } from '../utils/QRCodeGenerator';

describe('QRCodeGenerator', () => {
  describe('generateQRCode', () => {
    it('should generate QR code with correct format', async () => {
      const qrCode = QRCodeGenerator.generateQRCode('event-123', 'member-456', 'reg-789');

      expect(qrCode).toMatch(/^EVT-[A-Za-z0-9]{8}-[A-Za-z0-9]{8}-[A-Z0-9]{6}-\d+$/);
    });

    it('should generate unique QR codes', () => {
      const qr1 = QRCodeGenerator.generateQRCode('event-123', 'member-456', 'reg-789');
      const qr2 = QRCodeGenerator.generateQRCode('event-123', 'member-456', 'reg-789');

      expect(qr1).not.toBe(qr2);
    });

    it('should include event ID in QR code', () => {
      const eventId = 'event-12345678';
      const qrCode = QRCodeGenerator.generateQRCode(eventId, 'member-456', 'reg-789');

      expect(qrCode).toContain('event-12');
    });

    it('should include member ID in QR code', () => {
      const memberId = 'member-12345678';
      const qrCode = QRCodeGenerator.generateQRCode('event-123', memberId, 'reg-789');

      expect(qrCode).toContain('member-1');
    });
  });

  describe('validateQRCode', () => {
    it('should validate correct QR code format', () => {
      const qrCode = 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000';
      const isValid = QRCodeGenerator.validateQRCode(qrCode);

      expect(isValid).toBe(true);
    });

    it('should reject invalid QR code format', () => {
      const qrCode = 'INVALID-QR-CODE';
      const isValid = QRCodeGenerator.validateQRCode(qrCode);

      expect(isValid).toBe(false);
    });

    it('should reject QR code with wrong prefix', () => {
      const qrCode = 'WRONG-a1b2c3d4-e5f6g7h8-ABC123-1707849600000';
      const isValid = QRCodeGenerator.validateQRCode(qrCode);

      expect(isValid).toBe(false);
    });

    it('should reject QR code with missing parts', () => {
      const qrCode = 'EVT-a1b2c3d4-ABC123';
      const isValid = QRCodeGenerator.validateQRCode(qrCode);

      expect(isValid).toBe(false);
    });
  });

  describe('extractEventId', () => {
    it('should extract event ID from valid QR code', () => {
      const qrCode = 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000';
      const eventId = QRCodeGenerator.extractEventId(qrCode);

      expect(eventId).toBe('a1b2c3d4');
    });

    it('should return null for invalid QR code', () => {
      const qrCode = 'INVALID-QR-CODE';
      const eventId = QRCodeGenerator.extractEventId(qrCode);

      expect(eventId).toBeNull();
    });
  });

  describe('extractMemberId', () => {
    it('should extract member ID from valid QR code', () => {
      const qrCode = 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000';
      const memberId = QRCodeGenerator.extractMemberId(qrCode);

      expect(memberId).toBe('e5f6g7h8');
    });

    it('should return null for invalid QR code', () => {
      const qrCode = 'INVALID-QR-CODE';
      const memberId = QRCodeGenerator.extractMemberId(qrCode);

      expect(memberId).toBeNull();
    });
  });
});
