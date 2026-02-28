/**
 * Customer Primitive
 * Represents a customer with profile, addresses, and preferences
 */

import { Money } from './Money';

export interface ICustomerAddress {
  id: string;
  type: 'billing' | 'shipping' | 'other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ICustomerPreferences {
  language: string;
  currency: string;
  newsletter: boolean;
  notifications: boolean;
  marketingEmails: boolean;
}

export interface ICustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: ICustomerAddress[];
  preferences: ICustomerPreferences;
  loyaltyPoints: number;
  totalSpent: Money;
  createdAt: Date;
  updatedAt: Date;
}

export class Customer {
  private _id: string;
  private _email: string;
  private _firstName: string;
  private _lastName: string;
  private _phone?: string;
  private _addresses: Map<string, ICustomerAddress> = new Map();
  private _preferences: ICustomerPreferences;
  private _loyaltyPoints: number = 0;
  private _totalSpent: Money;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    currency: string = 'NGN',
  ) {
    if (!id || id.trim() === '') {
      throw new Error('Customer ID is required');
    }

    if (!email || !this._isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    if (!firstName || firstName.trim() === '') {
      throw new Error('First name is required');
    }

    if (!lastName || lastName.trim() === '') {
      throw new Error('Last name is required');
    }

    this._id = id;
    this._email = email;
    this._firstName = firstName;
    this._lastName = lastName;
    this._totalSpent = Money.zero(currency);
    this._preferences = {
      language: 'en',
      currency,
      newsletter: false,
      notifications: true,
      marketingEmails: false,
    };
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get addresses(): ICustomerAddress[] {
    return Array.from(this._addresses.values());
  }

  get preferences(): ICustomerPreferences {
    return { ...this._preferences };
  }

  get loyaltyPoints(): number {
    return this._loyaltyPoints;
  }

  get totalSpent(): Money {
    return this._totalSpent;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Set phone number
   */
  setPhone(phone: string): void {
    if (phone && !this._isValidPhone(phone)) {
      throw new Error('Invalid phone number');
    }

    this._phone = phone;
    this._updatedAt = new Date();
  }

  /**
   * Add address
   */
  addAddress(
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    type: 'billing' | 'shipping' | 'other' = 'other',
    isDefault: boolean = false,
  ): string {
    if (!street || !city || !state || !postalCode || !country) {
      throw new Error('All address fields are required');
    }

    const addressId = `addr-${Date.now()}`;
    const address: ICustomerAddress = {
      id: addressId,
      type,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    };

    // If this is default, unset other defaults of same type
    if (isDefault) {
      this._addresses.forEach(addr => {
        if (addr.type === type && addr.isDefault) {
          addr.isDefault = false;
        }
      });
    }

    this._addresses.set(addressId, address);
    this._updatedAt = new Date();
    return addressId;
  }

  /**
   * Update address
   */
  updateAddress(
    addressId: string,
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
  ): void {
    const address = this._addresses.get(addressId);
    if (!address) {
      throw new Error(`Address ${addressId} not found`);
    }

    if (!street || !city || !state || !postalCode || !country) {
      throw new Error('All address fields are required');
    }

    address.street = street;
    address.city = city;
    address.state = state;
    address.postalCode = postalCode;
    address.country = country;
    this._updatedAt = new Date();
  }

  /**
   * Remove address
   */
  removeAddress(addressId: string): void {
    if (!this._addresses.has(addressId)) {
      throw new Error(`Address ${addressId} not found`);
    }

    this._addresses.delete(addressId);
    this._updatedAt = new Date();
  }

  /**
   * Get address by ID
   */
  getAddress(addressId: string): ICustomerAddress | undefined {
    return this._addresses.get(addressId);
  }

  /**
   * Get default address by type
   */
  getDefaultAddress(type: 'billing' | 'shipping'): ICustomerAddress | undefined {
    for (const address of this._addresses.values()) {
      if (address.type === type && address.isDefault) {
        return address;
      }
    }
    return undefined;
  }

  /**
   * Set default address
   */
  setDefaultAddress(addressId: string): void {
    const address = this._addresses.get(addressId);
    if (!address) {
      throw new Error(`Address ${addressId} not found`);
    }

    // Unset other defaults of same type
    this._addresses.forEach(addr => {
      if (addr.type === address.type && addr.isDefault) {
        addr.isDefault = false;
      }
    });

    address.isDefault = true;
    this._updatedAt = new Date();
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<ICustomerPreferences>): void {
    this._preferences = { ...this._preferences, ...preferences };
    this._updatedAt = new Date();
  }

  /**
   * Earn loyalty points
   */
  earnLoyaltyPoints(points: number, reason?: string): void {
    if (points <= 0 || !Number.isInteger(points)) {
      throw new Error('Points must be a positive integer');
    }

    this._loyaltyPoints += points;
    this._updatedAt = new Date();
  }

  /**
   * Redeem loyalty points
   */
  redeemLoyaltyPoints(points: number, reason?: string): void {
    if (points <= 0 || !Number.isInteger(points)) {
      throw new Error('Points must be a positive integer');
    }

    if (this._loyaltyPoints < points) {
      throw new Error(`Insufficient loyalty points: ${this._loyaltyPoints} < ${points}`);
    }

    this._loyaltyPoints -= points;
    this._updatedAt = new Date();
  }

  /**
   * Record purchase
   */
  recordPurchase(amount: Money): void {
    if (!amount) {
      throw new Error('Amount is required');
    }

    this._totalSpent = this._totalSpent.add(amount);
    this._updatedAt = new Date();
  }

  /**
   * Get customer status
   */
  getStatus(): 'new' | 'regular' | 'loyal' {
    const daysSinceCreation = (Date.now() - this._createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceCreation < 30) {
      return 'new';
    }

    if (this._loyaltyPoints >= 1000 || this._totalSpent.amount >= 100000) {
      return 'loyal';
    }

    return 'regular';
  }

  /**
   * Validate email
   */
  private _isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone
   */
  private _isValidPhone(phone: string): boolean {
    // Basic validation - at least 10 digits
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Convert to JSON
   */
  toJSON(): ICustomer {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: this._phone,
      addresses: this.addresses,
      preferences: this._preferences,
      loyaltyPoints: this._loyaltyPoints,
      totalSpent: this._totalSpent,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
