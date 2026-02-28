/**
 * Economic Engine Error Classes
 */

export class EconomicEngineError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'EconomicEngineError';
  }
}

export class TransactionError extends EconomicEngineError {
  constructor(message: string, details?: Record<string, any>) {
    super('TRANSACTION_ERROR', message, 400, details);
    this.name = 'TransactionError';
  }
}

export class InsufficientFundsError extends EconomicEngineError {
  constructor(available: number, required: number) {
    super(
      'INSUFFICIENT_FUNDS',
      `Insufficient funds: available ${available}, required ${required}`,
      400,
      { available, required }
    );
    this.name = 'InsufficientFundsError';
  }
}

export class CommissionCalculationError extends EconomicEngineError {
  constructor(message: string, details?: Record<string, any>) {
    super('COMMISSION_CALCULATION_ERROR', message, 400, details);
    this.name = 'CommissionCalculationError';
  }
}

export class WalletError extends EconomicEngineError {
  constructor(message: string, details?: Record<string, any>) {
    super('WALLET_ERROR', message, 400, details);
    this.name = 'WalletError';
  }
}

export class PayoutError extends EconomicEngineError {
  constructor(message: string, details?: Record<string, any>) {
    super('PAYOUT_ERROR', message, 400, details);
    this.name = 'PayoutError';
  }
}

export class ComplianceError extends EconomicEngineError {
  constructor(message: string, details?: Record<string, any>) {
    super('COMPLIANCE_ERROR', message, 403, details);
    this.name = 'ComplianceError';
  }
}

export class ValidationError extends EconomicEngineError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}
