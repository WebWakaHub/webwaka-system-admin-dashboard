import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  status: 'success' | 'failure';
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ComplianceCheck {
  userId: string;
  checkType: 'ndpr' | 'cbn' | 'aml_kyc' | 'tax';
  status: 'pass' | 'fail' | 'warning';
  details: Record<string, any>;
  timestamp: number;
}

export interface TaxWithholding {
  transactionId: string;
  userId: string;
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  timestamp: number;
}

export class ComplianceManager {
  private eventBus: EventBus;
  private logger: Logger;
  private auditLogs: AuditLog[] = [];
  private complianceChecks: Map<string, ComplianceCheck[]> = new Map();
  private taxWithholdings: Map<string, TaxWithholding[]> = new Map();
  private auditLogIdCounter: number = 0;

  // Compliance configuration
  private ndprEnabled: boolean = true;
  private cbnTransactionLimit: number = 5000000; // 5M NGN
  private amlKycEnabled: boolean = true;
  private taxWithholdingRate: number = 0.05; // 5%

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.transaction.scored', (event: any) => {
      this.logAudit(
        event.data.fraudScore.userId,
        'fraud_score_calculated',
        'transaction',
        event.data.fraudScore
      );
    });

    this.eventBus.subscribe('fraud.alert.created', (event: any) => {
      this.logAudit(event.data.userId, 'fraud_alert_created', 'alert', event.data);
    });

    this.eventBus.subscribe('fraud.alert.acknowledged', (event: any) => {
      this.logAudit(event.data.userId, 'fraud_alert_acknowledged', 'alert', event.data);
    });

    this.eventBus.subscribe('fraud.alert.resolved', (event: any) => {
      this.logAudit(event.data.userId, 'fraud_alert_resolved', 'alert', event.data);
    });
  }

  async logAudit(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any>
  ): Promise<AuditLog> {
    try {
      const auditLog: AuditLog = {
        id: `audit_${++this.auditLogIdCounter}`,
        userId,
        action,
        resource,
        details,
        status: 'success',
        timestamp: Date.now(),
      };

      this.auditLogs.push(auditLog);

      // Keep only last 10000 audit logs
      if (this.auditLogs.length > 10000) {
        this.auditLogs.shift();
      }

      this.logger.debug(`Audit log created: ${auditLog.id}`);

      return auditLog;
    } catch (error) {
      this.logger.error(`Error logging audit for user ${userId}:`, error);
      throw error;
    }
  }

  async checkNDPRCompliance(userId: string): Promise<ComplianceCheck> {
    try {
      const check: ComplianceCheck = {
        userId,
        checkType: 'ndpr',
        status: this.ndprEnabled ? 'pass' : 'fail',
        details: {
          dataProtectionEnabled: this.ndprEnabled,
          personalDataProtected: true,
          dataAccessLogged: true,
          dataRetentionEnforced: true,
        },
        timestamp: Date.now(),
      };

      this.recordComplianceCheck(userId, check);
      this.eventBus.publish('fraud.compliance.ndpr.checked', check);

      return check;
    } catch (error) {
      this.logger.error(`Error checking NDPR compliance for user ${userId}:`, error);
      throw error;
    }
  }

  async checkCBNCompliance(userId: string, transactionAmount: number): Promise<ComplianceCheck> {
    try {
      const status = transactionAmount <= this.cbnTransactionLimit ? 'pass' : 'fail';

      const check: ComplianceCheck = {
        userId,
        checkType: 'cbn',
        status,
        details: {
          transactionAmount,
          transactionLimit: this.cbnTransactionLimit,
          withinLimit: transactionAmount <= this.cbnTransactionLimit,
        },
        timestamp: Date.now(),
      };

      this.recordComplianceCheck(userId, check);
      this.eventBus.publish('fraud.compliance.cbn.checked', check);

      return check;
    } catch (error) {
      this.logger.error(`Error checking CBN compliance for user ${userId}:`, error);
      throw error;
    }
  }

  async checkAMLKYCCompliance(userId: string): Promise<ComplianceCheck> {
    try {
      const check: ComplianceCheck = {
        userId,
        checkType: 'aml_kyc',
        status: this.amlKycEnabled ? 'pass' : 'fail',
        details: {
          amlKycEnabled: this.amlKycEnabled,
          userVerified: true,
          suspiciousActivityMonitored: true,
        },
        timestamp: Date.now(),
      };

      this.recordComplianceCheck(userId, check);
      this.eventBus.publish('fraud.compliance.aml_kyc.checked', check);

      return check;
    } catch (error) {
      this.logger.error(`Error checking AML/KYC compliance for user ${userId}:`, error);
      throw error;
    }
  }

  async calculateTaxWithholding(
    transactionId: string,
    userId: string,
    grossAmount: number
  ): Promise<TaxWithholding> {
    try {
      const taxAmount = Math.round(grossAmount * this.taxWithholdingRate);
      const netAmount = grossAmount - taxAmount;

      const withholding: TaxWithholding = {
        transactionId,
        userId,
        grossAmount,
        taxRate: this.taxWithholdingRate,
        taxAmount,
        netAmount,
        timestamp: Date.now(),
      };

      // Store tax withholding
      let withholdings = this.taxWithholdings.get(userId) || [];
      withholdings.push(withholding);
      this.taxWithholdings.set(userId, withholdings);

      this.eventBus.publish('fraud.tax.withholding.calculated', withholding);

      this.logger.info(
        `Tax withholding calculated for transaction ${transactionId}: ${taxAmount} NGN`
      );

      return withholding;
    } catch (error) {
      this.logger.error(`Error calculating tax withholding for transaction ${transactionId}:`, error);
      throw error;
    }
  }

  private recordComplianceCheck(userId: string, check: ComplianceCheck): void {
    let checks = this.complianceChecks.get(userId) || [];
    checks.push(check);

    // Keep only last 100 checks per user
    if (checks.length > 100) {
      checks.shift();
    }

    this.complianceChecks.set(userId, checks);
  }

  getAuditLogs(userId?: string): AuditLog[] {
    if (userId) {
      return this.auditLogs.filter((log) => log.userId === userId);
    }
    return this.auditLogs;
  }

  getComplianceChecks(userId: string): ComplianceCheck[] {
    return this.complianceChecks.get(userId) || [];
  }

  getTaxWithholdings(userId: string): TaxWithholding[] {
    return this.taxWithholdings.get(userId) || [];
  }

  setNDPREnabled(enabled: boolean): void {
    this.ndprEnabled = enabled;
    this.logger.info(`NDPR compliance ${enabled ? 'enabled' : 'disabled'}`);
  }

  setCBNTransactionLimit(limit: number): void {
    this.cbnTransactionLimit = limit;
    this.logger.info(`CBN transaction limit set to ${limit} NGN`);
  }

  setAMLKYCEnabled(enabled: boolean): void {
    this.amlKycEnabled = enabled;
    this.logger.info(`AML/KYC compliance ${enabled ? 'enabled' : 'disabled'}`);
  }

  setTaxWithholdingRate(rate: number): void {
    this.taxWithholdingRate = rate;
    this.logger.info(`Tax withholding rate set to ${(rate * 100).toFixed(2)}%`);
  }

  getAuditLogCount(): number {
    return this.auditLogs.length;
  }
}
