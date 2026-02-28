/**
 * Money Primitive
 * Represents a monetary value with currency support
 * Immutable, type-safe money operations
 */

export interface IMoneyValue {
  amount: number;
  currency: string;
}

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  // Supported currencies with their precision
  private static readonly SUPPORTED_CURRENCIES: Record<string, number> = {
    NGN: 2,  // Nigerian Naira
    USD: 2,  // US Dollar
    EUR: 2,  // Euro
    GBP: 2,  // British Pound
    ZAR: 2,  // South African Rand
    KES: 2,  // Kenyan Shilling
    GHS: 2,  // Ghanaian Cedi
    EGP: 2,  // Egyptian Pound
  };

  constructor(amount: number, currency: string) {
    // Validate amount
    if (!Number.isFinite(amount)) {
      throw new Error(`Invalid amount: ${amount}. Must be a finite number.`);
    }

    if (amount < 0) {
      throw new Error(`Invalid amount: ${amount}. Must be non-negative.`);
    }

    // Validate currency
    if (!Money.SUPPORTED_CURRENCIES[currency]) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // Round to currency precision
    const precision = Money.SUPPORTED_CURRENCIES[currency];
    this._amount = Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision);
    this._currency = currency;

    // Freeze to ensure immutability
    Object.freeze(this);
  }

  /**
   * Get the amount value
   */
  get amount(): number {
    return this._amount;
  }

  /**
   * Get the currency code
   */
  get currency(): string {
    return this._currency;
  }

  /**
   * Add another Money value
   */
  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot add different currencies: ${this._currency} and ${other._currency}`);
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  /**
   * Subtract another Money value
   */
  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot subtract different currencies: ${this._currency} and ${other._currency}`);
    }

    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error(`Insufficient balance: ${this._amount} ${this._currency} - ${other._amount} ${other._currency}`);
    }

    return new Money(result, this._currency);
  }

  /**
   * Multiply by a scalar value
   */
  multiply(multiplier: number): Money {
    if (!Number.isFinite(multiplier)) {
      throw new Error(`Invalid multiplier: ${multiplier}`);
    }

    if (multiplier < 0) {
      throw new Error(`Multiplier must be non-negative: ${multiplier}`);
    }

    return new Money(this._amount * multiplier, this._currency);
  }

  /**
   * Divide by a scalar value
   */
  divide(divisor: number): Money {
    if (!Number.isFinite(divisor)) {
      throw new Error(`Invalid divisor: ${divisor}`);
    }

    if (divisor === 0) {
      throw new Error('Division by zero');
    }

    if (divisor < 0) {
      throw new Error(`Divisor must be non-negative: ${divisor}`);
    }

    return new Money(this._amount / divisor, this._currency);
  }

  /**
   * Convert to another currency using exchange rate
   */
  convert(targetCurrency: string, exchangeRate: number): Money {
    if (!Money.SUPPORTED_CURRENCIES[targetCurrency]) {
      throw new Error(`Unsupported target currency: ${targetCurrency}`);
    }

    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      throw new Error(`Invalid exchange rate: ${exchangeRate}`);
    }

    return new Money(this._amount * exchangeRate, targetCurrency);
  }

  /**
   * Compare with another Money value
   */
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  /**
   * Check if greater than another Money value
   */
  greaterThan(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot compare different currencies: ${this._currency} and ${other._currency}`);
    }
    return this._amount > other._amount;
  }

  /**
   * Check if less than another Money value
   */
  lessThan(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot compare different currencies: ${this._currency} and ${other._currency}`);
    }
    return this._amount < other._amount;
  }

  /**
   * Check if greater than or equal to another Money value
   */
  greaterThanOrEqual(other: Money): boolean {
    return this.equals(other) || this.greaterThan(other);
  }

  /**
   * Check if less than or equal to another Money value
   */
  lessThanOrEqual(other: Money): boolean {
    return this.equals(other) || this.lessThan(other);
  }

  /**
   * Get the absolute value
   */
  absolute(): Money {
    return new Money(Math.abs(this._amount), this._currency);
  }

  /**
   * Format as string
   */
  toString(): string {
    return `${this._amount.toFixed(Money.SUPPORTED_CURRENCIES[this._currency])} ${this._currency}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): IMoneyValue {
    return {
      amount: this._amount,
      currency: this._currency,
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: IMoneyValue): Money {
    return new Money(json.amount, json.currency);
  }

  /**
   * Get supported currencies
   */
  static getSupportedCurrencies(): string[] {
    return Object.keys(Money.SUPPORTED_CURRENCIES);
  }

  /**
   * Check if currency is supported
   */
  static isSupportedCurrency(currency: string): boolean {
    return !!Money.SUPPORTED_CURRENCIES[currency];
  }

  /**
   * Zero value for a currency
   */
  static zero(currency: string): Money {
    return new Money(0, currency);
  }
}
