import { describe, it, expect } from 'vitest';
import { ReceiptGenerator } from '../utils/ReceiptGenerator';

describe('ReceiptGenerator', () => {
  describe('generateReceiptNumber', () => {
    it('should generate receipt number with correct format', () => {
      const receiptNumber = ReceiptGenerator.generateReceiptNumber();

      expect(receiptNumber).toMatch(/^RCP-\d{8}-[A-Z0-9]{6}$/);
    });

    it('should generate unique receipt numbers', () => {
      const receipt1 = ReceiptGenerator.generateReceiptNumber();
      const receipt2 = ReceiptGenerator.generateReceiptNumber();

      expect(receipt1).not.toBe(receipt2);
    });

    it('should include current date in receipt number', () => {
      const receiptNumber = ReceiptGenerator.generateReceiptNumber();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const expectedDate = `${year}${month}${day}`;

      expect(receiptNumber).toContain(expectedDate);
    });

    it('should generate alphanumeric random code', () => {
      const receiptNumber = ReceiptGenerator.generateReceiptNumber();
      const parts = receiptNumber.split('-');
      const randomCode = parts[2];

      expect(randomCode).toMatch(/^[A-Z0-9]{6}$/);
    });
  });

  describe('calculateNextPaymentDate', () => {
    it('should calculate next weekly payment date', () => {
      const currentDate = new Date('2026-02-13');
      const nextDate = ReceiptGenerator.calculateNextPaymentDate(currentDate, 'WEEKLY');

      const expected = new Date('2026-02-20');
      expect(nextDate.toDateString()).toBe(expected.toDateString());
    });

    it('should calculate next monthly payment date', () => {
      const currentDate = new Date('2026-02-13');
      const nextDate = ReceiptGenerator.calculateNextPaymentDate(currentDate, 'MONTHLY');

      const expected = new Date('2026-03-13');
      expect(nextDate.toDateString()).toBe(expected.toDateString());
    });

    it('should calculate next quarterly payment date', () => {
      const currentDate = new Date('2026-02-13');
      const nextDate = ReceiptGenerator.calculateNextPaymentDate(currentDate, 'QUARTERLY');

      const expected = new Date('2026-05-13');
      expect(nextDate.toDateString()).toBe(expected.toDateString());
    });

    it('should calculate next annual payment date', () => {
      const currentDate = new Date('2026-02-13');
      const nextDate = ReceiptGenerator.calculateNextPaymentDate(currentDate, 'ANNUALLY');

      const expected = new Date('2027-02-13');
      expect(nextDate.toDateString()).toBe(expected.toDateString());
    });

    it('should throw error for invalid frequency', () => {
      const currentDate = new Date('2026-02-13');

      expect(() => {
        ReceiptGenerator.calculateNextPaymentDate(currentDate, 'INVALID');
      }).toThrow('Invalid frequency: INVALID');
    });

    it('should handle month-end dates correctly', () => {
      const currentDate = new Date('2026-01-31');
      const nextDate = ReceiptGenerator.calculateNextPaymentDate(currentDate, 'MONTHLY');

      // Should handle February correctly (28/29 days)
      expect(nextDate.getMonth()).toBe(1); // February (0-indexed)
    });

    it('should handle leap year correctly', () => {
      const currentDate = new Date('2024-02-29'); // Leap year
      const nextDate = ReceiptGenerator.calculateNextPaymentDate(currentDate, 'ANNUALLY');

      expect(nextDate.getFullYear()).toBe(2025);
    });
  });
});
