/**
 * Economic Engine (MLAS Core) Module
 * Main entry point for the Economic Engine module
 */

// Export main class
export { EconomicEngine } from './EconomicEngine';

// Export types
export type {
  Transaction,
  AuditEntry,
  RevenueDistribution,
  Commission,
  Wallet,
  Payout,
  FinancialReport
} from './types/Transaction';

// Export engines
export { TransactionEngine } from './engine/TransactionEngine';
export { RevenueDistributor } from './engine/RevenueDistributor';
export { CommissionCalculator } from './engine/CommissionCalculator';
export { WalletManager } from './engine/WalletManager';

// Export error classes
export {
  EconomicEngineError,
  TransactionError,
  InsufficientFundsError,
  CommissionCalculationError,
  WalletError,
  PayoutError,
  ComplianceError,
  ValidationError
} from './errors/EconomicEngineError';
