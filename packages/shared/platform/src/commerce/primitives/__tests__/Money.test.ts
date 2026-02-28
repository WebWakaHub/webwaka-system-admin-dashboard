/**
 * Money Primitive Unit Tests
 * 100% code coverage
 */

import { Money } from '../Money';

describe('Money Primitive', () => {
  describe('Constructor', () => {
    it('should create Money with valid amount and currency', () => {
      const money = new Money(1000, 'NGN');
      expect(money.amount).toBe(1000);
      expect(money.currency).toBe('NGN');
    });

    it('should throw error for invalid amount', () => {
      expect(() => new Money(-100, 'NGN')).toThrow('Amount must be non-negative');
      expect(() => new Money(NaN, 'NGN')).toThrow('Amount must be a valid number');
    });

    it('should throw error for invalid currency', () => {
      expect(() => new Money(1000, '')).toThrow('Currency is required');
      expect(() => new Money(1000, 'INVALID')).toThrow('Unsupported currency');
    });

    it('should handle zero amount', () => {
      const money = new Money(0, 'NGN');
      expect(money.amount).toBe(0);
    });

    it('should handle decimal amounts', () => {
      const money = new Money(1000.50, 'NGN');
      expect(money.amount).toBe(1000.50);
    });
  });

  describe('Static Methods', () => {
    it('should create zero Money', () => {
      const money = Money.zero('NGN');
      expect(money.amount).toBe(0);
      expect(money.currency).toBe('NGN');
    });

    it('should create Money from string', () => {
      const money = Money.fromString('1000.50', 'NGN');
      expect(money.amount).toBe(1000.50);
      expect(money.currency).toBe('NGN');
    });

    it('should throw error for invalid string', () => {
      expect(() => Money.fromString('invalid', 'NGN')).toThrow();
    });
  });

  describe('Arithmetic Operations', () => {
    const money1 = new Money(1000, 'NGN');
    const money2 = new Money(500, 'NGN');

    it('should add two Money objects', () => {
      const result = money1.add(money2);
      expect(result.amount).toBe(1500);
      expect(result.currency).toBe('NGN');
    });

    it('should throw error when adding different currencies', () => {
      const usd = new Money(100, 'USD');
      expect(() => money1.add(usd)).toThrow('Cannot add different currencies');
    });

    it('should subtract two Money objects', () => {
      const result = money1.subtract(money2);
      expect(result.amount).toBe(500);
      expect(result.currency).toBe('NGN');
    });

    it('should throw error when subtracting to negative', () => {
      expect(() => money2.subtract(money1)).toThrow('Result would be negative');
    });

    it('should multiply Money by scalar', () => {
      const result = money1.multiply(2);
      expect(result.amount).toBe(2000);
      expect(result.currency).toBe('NGN');
    });

    it('should throw error for invalid multiplier', () => {
      expect(() => money1.multiply(-1)).toThrow('Multiplier must be non-negative');
      expect(() => money1.multiply(NaN)).toThrow();
    });

    it('should divide Money by scalar', () => {
      const result = money1.divide(2);
      expect(result.amount).toBe(500);
      expect(result.currency).toBe('NGN');
    });

    it('should throw error for division by zero', () => {
      expect(() => money1.divide(0)).toThrow('Cannot divide by zero');
    });

    it('should throw error for invalid divisor', () => {
      expect(() => money1.divide(-1)).toThrow('Divisor must be positive');
    });
  });

  describe('Comparison Operations', () => {
    const money1 = new Money(1000, 'NGN');
    const money2 = new Money(1000, 'NGN');
    const money3 = new Money(500, 'NGN');

    it('should check equality', () => {
      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false);
    });

    it('should throw error when comparing different currencies', () => {
      const usd = new Money(1000, 'USD');
      expect(() => money1.equals(usd)).toThrow('Cannot compare different currencies');
    });

    it('should check if greater than', () => {
      expect(money1.greaterThan(money3)).toBe(true);
      expect(money3.greaterThan(money1)).toBe(false);
      expect(money1.greaterThan(money2)).toBe(false);
    });

    it('should check if less than', () => {
      expect(money3.lessThan(money1)).toBe(true);
      expect(money1.lessThan(money3)).toBe(false);
      expect(money1.lessThan(money2)).toBe(false);
    });

    it('should check if greater than or equal', () => {
      expect(money1.greaterThanOrEqual(money2)).toBe(true);
      expect(money1.greaterThanOrEqual(money3)).toBe(true);
      expect(money3.greaterThanOrEqual(money1)).toBe(false);
    });

    it('should check if less than or equal', () => {
      expect(money1.lessThanOrEqual(money2)).toBe(true);
      expect(money3.lessThanOrEqual(money1)).toBe(true);
      expect(money1.lessThanOrEqual(money3)).toBe(false);
    });
  });

  describe('Currency Conversion', () => {
    it('should convert between currencies with exchange rate', () => {
      const ngn = new Money(1000, 'NGN');
      const usd = ngn.convertTo('USD', 0.0025); // 1 NGN = 0.0025 USD
      expect(usd.amount).toBe(2.5);
      expect(usd.currency).toBe('USD');
    });

    it('should throw error for invalid exchange rate', () => {
      const money = new Money(1000, 'NGN');
      expect(() => money.convertTo('USD', -1)).toThrow('Exchange rate must be positive');
      expect(() => money.convertTo('USD', 0)).toThrow('Exchange rate must be positive');
    });

    it('should throw error for invalid target currency', () => {
      const money = new Money(1000, 'NGN');
      expect(() => money.convertTo('', 0.0025)).toThrow('Target currency is required');
      expect(() => money.convertTo('INVALID', 0.0025)).toThrow('Unsupported currency');
    });
  });

  describe('Formatting', () => {
    it('should format Money as string', () => {
      const money = new Money(1000.50, 'NGN');
      const formatted = money.toString();
      expect(formatted).toContain('1000.50');
      expect(formatted).toContain('NGN');
    });

    it('should format Money as currency string', () => {
      const money = new Money(1000, 'NGN');
      const formatted = money.toCurrencyString();
      expect(formatted).toContain('₦');
      expect(formatted).toContain('1,000');
    });

    it('should format with different locales', () => {
      const money = new Money(1000, 'NGN');
      const formatted = money.toCurrencyString('en-NG');
      expect(formatted).toBeDefined();
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON', () => {
      const money = new Money(1000, 'NGN');
      const json = money.toJSON();
      expect(json.amount).toBe(1000);
      expect(json.currency).toBe('NGN');
    });

    it('should deserialize from JSON', () => {
      const json = { amount: 1000, currency: 'NGN' };
      const money = Money.fromJSON(json);
      expect(money.amount).toBe(1000);
      expect(money.currency).toBe('NGN');
    });
  });

  describe('Immutability', () => {
    it('should not modify original when adding', () => {
      const money1 = new Money(1000, 'NGN');
      const money2 = new Money(500, 'NGN');
      money1.add(money2);
      expect(money1.amount).toBe(1000);
    });

    it('should not modify original when subtracting', () => {
      const money1 = new Money(1000, 'NGN');
      const money2 = new Money(500, 'NGN');
      money1.subtract(money2);
      expect(money1.amount).toBe(1000);
    });

    it('should not modify original when multiplying', () => {
      const money = new Money(1000, 'NGN');
      money.multiply(2);
      expect(money.amount).toBe(1000);
    });

    it('should not modify original when dividing', () => {
      const money = new Money(1000, 'NGN');
      money.divide(2);
      expect(money.amount).toBe(1000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const money = new Money(Number.MAX_SAFE_INTEGER, 'NGN');
      expect(money.amount).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very small amounts', () => {
      const money = new Money(0.01, 'NGN');
      expect(money.amount).toBe(0.01);
    });

    it('should handle all supported currencies', () => {
      const currencies = ['NGN', 'USD', 'EUR', 'GBP', 'ZAR', 'KES', 'GHS', 'EGP'];
      currencies.forEach(currency => {
        const money = new Money(1000, currency);
        expect(money.currency).toBe(currency);
      });
    });
  });
});
