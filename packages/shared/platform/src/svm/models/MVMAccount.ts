/**
 * MVM Account Model
 * Represents a Minimum Viable Merchant account
 */

export interface MVMAccount {
  readonly accountId: string;
  businessName: string;
  email: string;
  passwordHash: string;
  currency: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MVMAccountModel implements MVMAccount {
  readonly accountId: string;
  businessName: string;
  email: string;
  passwordHash: string;
  currency: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    accountId: string,
    businessName: string,
    email: string,
    passwordHash: string,
    currency: string = 'NGN',
    language: string = 'en'
  ) {
    this.accountId = accountId;
    this.businessName = businessName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.currency = currency;
    this.language = language;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateProfile(businessName: string, email: string): void {
    this.businessName = businessName;
    this.email = email;
    this.updatedAt = new Date();
  }

  updateSettings(currency: string, language: string): void {
    this.currency = currency;
    this.language = language;
    this.updatedAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      accountId: this.accountId,
      businessName: this.businessName,
      email: this.email,
      currency: this.currency,
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
