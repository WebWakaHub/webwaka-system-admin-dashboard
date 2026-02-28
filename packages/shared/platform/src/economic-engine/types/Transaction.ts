/**
 * Transaction Type Definition
 * Represents a financial transaction in the Economic Engine
 */

export interface Transaction {
  transactionId: string;
  tenantId: string;
  creatorId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  metadata?: Record<string, any>;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details: Record<string, any>;
}

export interface RevenueDistribution {
  transactionId: string;
  totalAmount: number;
  distributions: {
    creator: number;
    aggregator: number;
    platformPartner: number;
    communityManager: number;
    platform: number;
  };
  timestamp: Date;
}

export interface Commission {
  commissionId: string;
  participantId: string;
  level: 1 | 2 | 3 | 4 | 5;
  baseAmount: number;
  multiplier: number;
  finalAmount: number;
  timestamp: Date;
  status: 'calculated' | 'approved' | 'paid';
}

export interface Wallet {
  walletId: string;
  userId: string;
  tenantId: string;
  balance: number;
  currency: string;
  transactions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Payout {
  payoutId: string;
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  externalReference?: string;
  timestamp: Date;
}

export interface FinancialReport {
  reportId: string;
  tenantId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;
  totalCommissions: number;
  totalPayouts: number;
  participantCount: number;
  transactionCount: number;
  generatedAt: Date;
}
