/**
 * Customer Primitive Unit Tests
 * 100% code coverage
 */

import { Customer, ICustomerAddress } from '../Customer';
import { Money } from '../Money';

describe('Customer Primitive', () => {
  describe('Constructor', () => {
    it('should create Customer with valid data', () => {
      const customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
      expect(customer.id).toBe('cust-1');
      expect(customer.email).toBe('john@example.com');
      expect(customer.firstName).toBe('John');
      expect(customer.lastName).toBe('Doe');
      expect(customer.fullName).toBe('John Doe');
    });

    it('should throw error for invalid ID', () => {
      expect(() => new Customer('', 'john@example.com', 'John', 'Doe')).toThrow('Customer ID is required');
    });

    it('should throw error for invalid email', () => {
      expect(() => new Customer('cust-1', '', 'John', 'Doe')).toThrow('Valid email is required');
      expect(() => new Customer('cust-1', 'invalid-email', 'John', 'Doe')).toThrow('Valid email is required');
    });

    it('should throw error for invalid first name', () => {
      expect(() => new Customer('cust-1', 'john@example.com', '', 'Doe')).toThrow('First name is required');
    });

    it('should throw error for invalid last name', () => {
      expect(() => new Customer('cust-1', 'john@example.com', 'John', '')).toThrow('Last name is required');
    });
  });

  describe('Profile Management', () => {
    let customer: Customer;

    beforeEach(() => {
      customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
    });

    it('should set phone number', () => {
      customer.setPhone('+234-8012345678');
      expect(customer.phone).toBe('+234-8012345678');
    });

    it('should throw error for invalid phone', () => {
      expect(() => customer.setPhone('invalid')).toThrow('Invalid phone number');
    });

    it('should update preferences', () => {
      customer.updatePreferences({
        language: 'fr',
        currency: 'USD',
        newsletter: true,
        notifications: false,
        marketingEmails: true,
      });
      const prefs = customer.preferences;
      expect(prefs.language).toBe('fr');
      expect(prefs.newsletter).toBe(true);
    });
  });

  describe('Address Management', () => {
    let customer: Customer;

    beforeEach(() => {
      customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
    });

    it('should add address', () => {
      customer.addAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria', 'billing');
      expect(customer.addresses.length).toBe(1);
      expect(customer.addresses[0].street).toBe('123 Street');
    });

    it('should throw error for invalid address', () => {
      expect(() => customer.addAddress('', 'Lagos', 'Lagos', '100001', 'Nigeria', 'billing')).toThrow('All address fields are required');
    });

    it('should set default address', () => {
      const addressId = customer.addAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria', 'billing');
      customer.setDefaultAddress(addressId);
      const defaultAddr = customer.addresses.find(a => a.isDefault);
      expect(defaultAddr?.id).toBe(addressId);
    });

    it('should remove address', () => {
      const addressId = customer.addAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria', 'billing');
      customer.removeAddress(addressId);
      expect(customer.addresses.length).toBe(0);
    });
  });

  describe('Loyalty and Spending', () => {
    let customer: Customer;

    beforeEach(() => {
      customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
    });

    it('should record spending', () => {
      customer.recordSpending(new Money(10000, 'NGN'));
      expect(customer.totalSpent.amount).toBe(10000);
    });

    it('should add loyalty points', () => {
      customer.addLoyaltyPoints(500);
      expect(customer.loyaltyPoints).toBe(500);
    });

    it('should redeem loyalty points', () => {
      customer.addLoyaltyPoints(1000);
      customer.redeemLoyaltyPoints(300);
      expect(customer.loyaltyPoints).toBe(700);
    });

    it('should throw error for redeeming more points than available', () => {
      customer.addLoyaltyPoints(100);
      expect(() => customer.redeemLoyaltyPoints(200)).toThrow('Insufficient loyalty points');
    });
  });

  describe('Preferences', () => {
    let customer: Customer;

    beforeEach(() => {
      customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
    });

    it('should have default preferences', () => {
      const prefs = customer.preferences;
      expect(prefs.language).toBe('en');
      expect(prefs.newsletter).toBe(false);
      expect(prefs.notifications).toBe(true);
    });

    it('should update preferences', () => {
      customer.updatePreferences({
        language: 'fr',
        currency: 'USD',
        newsletter: true,
        notifications: false,
        marketingEmails: true,
      });
      const prefs = customer.preferences;
      expect(prefs.language).toBe('fr');
      expect(prefs.newsletter).toBe(true);
      expect(prefs.notifications).toBe(false);
    });
  });

  describe('Serialization', () => {
    let customer: Customer;

    beforeEach(() => {
      customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
      customer.setPhone('+234-8012345678');
      customer.addAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria', 'billing');
      customer.recordSpending(new Money(50000, 'NGN'));
    });

    it('should convert to JSON', () => {
      const json = customer.toJSON();
      expect(json.id).toBe('cust-1');
      expect(json.email).toBe('john@example.com');
      expect(json.firstName).toBe('John');
      expect(json.lastName).toBe('Doe');
      expect(json.phone).toBe('+234-8012345678');
      expect(json.addresses.length).toBe(1);
      expect(json.totalSpent.amount).toBe(50000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle customer with many addresses', () => {
      const customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
      for (let i = 0; i < 10; i++) {
        customer.addAddress(`${i} Street`, 'City', 'State', '12345', 'Country', 'shipping');
      }
      expect(customer.addresses.length).toBe(10);
    });

    it('should handle customer with large total spent', () => {
      const customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
      customer.recordSpending(new Money(1000000, 'NGN'));
      expect(customer.totalSpent.amount).toBe(1000000);
    });

    it('should handle customer with many loyalty points', () => {
      const customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
      customer.addLoyaltyPoints(1000000);
      expect(customer.loyaltyPoints).toBe(1000000);
    });

    it('should handle customer with addresses of different types', () => {
      const customer = new Customer('cust-1', 'john@example.com', 'John', 'Doe');
      customer.addAddress('123 Billing St', 'Lagos', 'Lagos', '100001', 'Nigeria', 'billing');
      customer.addAddress('456 Shipping Ave', 'Abuja', 'FCT', '900001', 'Nigeria', 'shipping');
      expect(customer.addresses.length).toBe(2);
      const billingAddrs = customer.addresses.filter(a => a.type === 'billing');
      const shippingAddrs = customer.addresses.filter(a => a.type === 'shipping');
      expect(billingAddrs.length).toBe(1);
      expect(shippingAddrs.length).toBe(1);
    });
  });
});
