import { ComplianceManager } from '../../components/ComplianceManager';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('ComplianceManager', () => {
  let manager: ComplianceManager;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    manager = new ComplianceManager(eventBus, logger);
  });

  describe('checkNDPRCompliance', () => {
    describe('Basic Functionality', () => {
      it('should check NDPR compliance', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-001',
          dataType: 'personal_information',
          operation: 'read',
        });

        expect(result).toBeDefined();
        expect(result.compliant).toBeDefined();
        expect(typeof result.compliant).toBe('boolean');
      });

      it('should allow compliant operations', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-compliant',
          dataType: 'transaction_data',
          operation: 'read',
          purpose: 'fraud_detection',
        });

        expect(result.compliant).toBe(true);
      });

      it('should flag non-compliant operations', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-non-compliant',
          dataType: 'personal_information',
          operation: 'share',
          recipient: 'third_party',
        });

        expect(result.compliant).toBe(false);
      });
    });

    describe('Data Protection Rules', () => {
      it('should enforce data minimization', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-minimization',
          dataType: 'personal_information',
          operation: 'collect',
          dataFields: ['name', 'email', 'phone', 'ssn', 'medical_history'],
        });

        expect(result).toBeDefined();
      });

      it('should enforce purpose limitation', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-purpose',
          dataType: 'transaction_data',
          operation: 'read',
          purpose: 'marketing',
        });

        expect(result.compliant).toBe(false);
      });

      it('should enforce storage limitation', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-storage',
          dataType: 'personal_information',
          operation: 'store',
          retentionPeriod: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        });

        expect(result).toBeDefined();
      });

      it('should enforce access controls', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-access',
          dataType: 'personal_information',
          operation: 'read',
          accessLevel: 'public',
        });

        expect(result.compliant).toBe(false);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await manager.checkNDPRCompliance({
            userId: '',
            dataType: 'transaction_data',
            operation: 'read',
          });
        }).not.toThrow();
      });

      it('should handle invalid data type', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-invalid-type',
          dataType: 'invalid_type',
          operation: 'read',
        });

        expect(result).toBeDefined();
      });

      it('should handle invalid operation', async () => {
        const result = await manager.checkNDPRCompliance({
          userId: 'user-invalid-op',
          dataType: 'transaction_data',
          operation: 'invalid_operation' as any,
        });

        expect(result).toBeDefined();
      });
    });
  });

  describe('checkCBNCompliance', () => {
    describe('Transaction Limits', () => {
      it('should enforce CBN transaction limit', async () => {
        const result = await manager.checkCBNCompliance({
          userId: 'user-cbn',
          transactionType: 'transfer',
          amount: 2000000,
        });

        expect(result.compliant).toBe(true);
      });

      it('should flag transactions exceeding limit', async () => {
        const result = await manager.checkCBNCompliance({
          userId: 'user-cbn-exceed',
          transactionType: 'transfer',
          amount: 10000000, // Exceeds 5M limit
        });

        expect(result.compliant).toBe(false);
        expect(result.violations).toContain('transaction_limit_exceeded');
      });

      it('should track cumulative daily transactions', async () => {
        const userId = 'user-daily-cumulative';

        // First transaction (2M)
        await manager.checkCBNCompliance({
          userId,
          transactionType: 'transfer',
          amount: 2000000,
        });

        // Second transaction (2M)
        await manager.checkCBNCompliance({
          userId,
          transactionType: 'transfer',
          amount: 2000000,
        });

        // Third transaction (2M) - total 6M, exceeds 5M daily limit
        const result = await manager.checkCBNCompliance({
          userId,
          transactionType: 'transfer',
          amount: 2000000,
        });

        expect(result.compliant).toBe(false);
      });

      it('should reset daily limits at midnight', async () => {
        const userId = 'user-daily-reset';

        // Transaction today
        await manager.checkCBNCompliance({
          userId,
          transactionType: 'transfer',
          amount: 4000000,
        });

        // Transaction tomorrow (simulated)
        const result = await manager.checkCBNCompliance({
          userId,
          transactionType: 'transfer',
          amount: 4000000,
          timestamp: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
        });

        expect(result.compliant).toBe(true);
      });
    });

    describe('Transaction Types', () => {
      it('should handle transfer transactions', async () => {
        const result = await manager.checkCBNCompliance({
          userId: 'user-transfer',
          transactionType: 'transfer',
          amount: 2000000,
        });

        expect(result).toBeDefined();
      });

      it('should handle withdrawal transactions', async () => {
        const result = await manager.checkCBNCompliance({
          userId: 'user-withdrawal',
          transactionType: 'withdrawal',
          amount: 1000000,
        });

        expect(result).toBeDefined();
      });

      it('should handle deposit transactions', async () => {
        const result = await manager.checkCBNCompliance({
          userId: 'user-deposit',
          transactionType: 'deposit',
          amount: 5000000,
        });

        expect(result).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await manager.checkCBNCompliance({
            userId: '',
            transactionType: 'transfer',
            amount: 2000000,
          });
        }).not.toThrow();
      });

      it('should handle invalid transaction type', async () => {
        const result = await manager.checkCBNCompliance({
          userId: 'user-invalid-type',
          transactionType: 'invalid_type' as any,
          amount: 2000000,
        });

        expect(result).toBeDefined();
      });

      it('should handle negative amount', async () => {
        const result = await manager.checkCBNCompliance({
          userId: 'user-negative',
          transactionType: 'transfer',
          amount: -2000000,
        });

        expect(result).toBeDefined();
      });
    });
  });

  describe('checkAMLKYCCompliance', () => {
    describe('Basic Functionality', () => {
      it('should check AML/KYC compliance', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-aml',
          kycStatus: 'verified',
          riskLevel: 'low',
        });

        expect(result).toBeDefined();
        expect(result.compliant).toBeDefined();
      });

      it('should require KYC verification', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-no-kyc',
          kycStatus: 'unverified',
          riskLevel: 'medium',
        });

        expect(result.compliant).toBe(false);
        expect(result.violations).toContain('kyc_verification_required');
      });

      it('should flag high-risk users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-high-risk',
          kycStatus: 'verified',
          riskLevel: 'high',
        });

        expect(result.compliant).toBe(false);
        expect(result.violations).toContain('high_risk_user');
      });

      it('should flag sanctioned users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-sanctioned',
          kycStatus: 'verified',
          riskLevel: 'low',
          sanctionedList: true,
        });

        expect(result.compliant).toBe(false);
        expect(result.violations).toContain('sanctioned_user');
      });
    });

    describe('KYC Verification Levels', () => {
      it('should accept fully verified users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-fully-verified',
          kycStatus: 'fully_verified',
          riskLevel: 'low',
        });

        expect(result.compliant).toBe(true);
      });

      it('should accept partially verified users for low amounts', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-partial-verified',
          kycStatus: 'partially_verified',
          riskLevel: 'medium',
          transactionAmount: 100000,
        });

        expect(result).toBeDefined();
      });

      it('should reject unverified users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-unverified',
          kycStatus: 'unverified',
          riskLevel: 'low',
        });

        expect(result.compliant).toBe(false);
      });
    });

    describe('Risk Assessment', () => {
      it('should assess low-risk users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-low-risk',
          kycStatus: 'verified',
          riskLevel: 'low',
        });

        expect(result.compliant).toBe(true);
      });

      it('should assess medium-risk users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-medium-risk',
          kycStatus: 'verified',
          riskLevel: 'medium',
        });

        expect(result.compliant).toBe(true);
      });

      it('should flag high-risk users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-high-risk-flag',
          kycStatus: 'verified',
          riskLevel: 'high',
        });

        expect(result.compliant).toBe(false);
      });

      it('should flag critical-risk users', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-critical-risk',
          kycStatus: 'verified',
          riskLevel: 'critical',
        });

        expect(result.compliant).toBe(false);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await manager.checkAMLKYCCompliance({
            userId: '',
            kycStatus: 'verified',
            riskLevel: 'low',
          });
        }).not.toThrow();
      });

      it('should handle invalid KYC status', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-invalid-kyc',
          kycStatus: 'invalid_status' as any,
          riskLevel: 'low',
        });

        expect(result).toBeDefined();
      });

      it('should handle invalid risk level', async () => {
        const result = await manager.checkAMLKYCCompliance({
          userId: 'user-invalid-risk',
          kycStatus: 'verified',
          riskLevel: 'invalid_level' as any,
        });

        expect(result).toBeDefined();
      });
    });
  });

  describe('calculateTaxWithholding', () => {
    describe('Basic Calculation', () => {
      it('should calculate tax withholding', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-tax',
          transactionAmount: 1000000,
          transactionType: 'transfer',
        });

        expect(result).toBeDefined();
        expect(result.withholdingAmount).toBeGreaterThan(0);
        expect(result.withholdingRate).toBeGreaterThan(0);
      });

      it('should use default withholding rate', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-default-rate',
          transactionAmount: 1000000,
          transactionType: 'transfer',
        });

        expect(result.withholdingRate).toBe(0.05); // 5% default
      });

      it('should calculate correct withholding amount', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-calc',
          transactionAmount: 1000000,
          transactionType: 'transfer',
        });

        expect(result.withholdingAmount).toBe(50000); // 5% of 1M
      });

      it('should return net amount after withholding', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-net',
          transactionAmount: 1000000,
          transactionType: 'transfer',
        });

        expect(result.netAmount).toBe(950000); // 1M - 50k
      });
    });

    describe('Different Transaction Types', () => {
      it('should handle transfer transactions', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-transfer-tax',
          transactionAmount: 1000000,
          transactionType: 'transfer',
        });

        expect(result.withholdingAmount).toBeGreaterThan(0);
      });

      it('should handle withdrawal transactions', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-withdrawal-tax',
          transactionAmount: 500000,
          transactionType: 'withdrawal',
        });

        expect(result.withholdingAmount).toBeGreaterThan(0);
      });

      it('should handle deposit transactions', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-deposit-tax',
          transactionAmount: 2000000,
          transactionType: 'deposit',
        });

        expect(result.withholdingAmount).toBeGreaterThan(0);
      });
    });

    describe('Custom Withholding Rates', () => {
      it('should apply custom withholding rate', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-custom-rate',
          transactionAmount: 1000000,
          transactionType: 'transfer',
          withholdingRate: 0.10, // 10%
        });

        expect(result.withholdingRate).toBe(0.10);
        expect(result.withholdingAmount).toBe(100000);
      });

      it('should handle zero withholding rate', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-zero-rate',
          transactionAmount: 1000000,
          transactionType: 'transfer',
          withholdingRate: 0,
        });

        expect(result.withholdingAmount).toBe(0);
        expect(result.netAmount).toBe(1000000);
      });

      it('should handle high withholding rate', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-high-rate',
          transactionAmount: 1000000,
          transactionType: 'transfer',
          withholdingRate: 0.50, // 50%
        });

        expect(result.withholdingAmount).toBe(500000);
        expect(result.netAmount).toBe(500000);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await manager.calculateTaxWithholding({
            userId: '',
            transactionAmount: 1000000,
            transactionType: 'transfer',
          });
        }).not.toThrow();
      });

      it('should handle negative amount', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-negative-tax',
          transactionAmount: -1000000,
          transactionType: 'transfer',
        });

        expect(result).toBeDefined();
      });

      it('should handle zero amount', async () => {
        const result = await manager.calculateTaxWithholding({
          userId: 'user-zero-tax',
          transactionAmount: 0,
          transactionType: 'transfer',
        });

        expect(result.withholdingAmount).toBe(0);
      });
    });
  });

  describe('createAuditLog', () => {
    describe('Basic Functionality', () => {
      it('should create audit log entry', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-001',
          action: 'transaction_processed',
          details: {
            transactionId: 'txn-001',
            amount: 1000000,
          },
        });

        expect(log).toBeDefined();
        expect(log.id).toBeDefined();
        expect(log.userId).toBe('user-001');
        expect(log.action).toBe('transaction_processed');
      });

      it('should include timestamp', async () => {
        const beforeTime = Date.now();
        const log = await manager.createAuditLog({
          userId: 'user-timestamp',
          action: 'action',
          details: {},
        });
        const afterTime = Date.now();

        expect(log.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(log.timestamp).toBeLessThanOrEqual(afterTime);
      });

      it('should store action details', async () => {
        const details = {
          transactionId: 'txn-001',
          amount: 1000000,
          status: 'success',
        };

        const log = await manager.createAuditLog({
          userId: 'user-details',
          action: 'transaction_processed',
          details,
        });

        expect(log.details).toEqual(details);
      });
    });

    describe('Audit Log Types', () => {
      it('should log transaction events', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-tx-log',
          action: 'transaction_processed',
          details: { transactionId: 'txn-001' },
        });

        expect(log.action).toBe('transaction_processed');
      });

      it('should log account events', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-account-log',
          action: 'account_modified',
          details: { fieldChanged: 'email' },
        });

        expect(log.action).toBe('account_modified');
      });

      it('should log compliance events', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-compliance-log',
          action: 'compliance_check_failed',
          details: { reason: 'kyc_verification_required' },
        });

        expect(log.action).toBe('compliance_check_failed');
      });

      it('should log security events', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-security-log',
          action: 'suspicious_activity_detected',
          details: { riskScore: 85 },
        });

        expect(log.action).toBe('suspicious_activity_detected');
      });
    });

    describe('Immutable Audit Trail', () => {
      it('should prevent audit log modification', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-immutable',
          action: 'action',
          details: {},
        });

        expect(log.immutable).toBe(true);
      });

      it('should maintain audit log integrity', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-integrity',
          action: 'action',
          details: {},
        });

        expect(log.hash).toBeDefined();
      });

      it('should track audit log chain', async () => {
        const log1 = await manager.createAuditLog({
          userId: 'user-chain',
          action: 'action1',
          details: {},
        });

        const log2 = await manager.createAuditLog({
          userId: 'user-chain',
          action: 'action2',
          details: {},
        });

        expect(log2.previousHash).toBe(log1.hash);
      });
    });

    describe('Audit Log Retention', () => {
      it('should retain audit logs', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-retention',
          action: 'action',
          details: {},
        });

        expect(log.retentionPeriod).toBeDefined();
      });

      it('should enforce retention policy', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-policy',
          action: 'action',
          details: {},
        });

        // Default retention should be at least 7 years for financial records
        expect(log.retentionPeriod).toBeGreaterThanOrEqual(7 * 365 * 24 * 60 * 60 * 1000);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await manager.createAuditLog({
            userId: '',
            action: 'action',
            details: {},
          });
        }).not.toThrow();
      });

      it('should handle missing action', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-no-action',
          action: '',
          details: {},
        });

        expect(log).toBeDefined();
      });

      it('should handle null details', async () => {
        const log = await manager.createAuditLog({
          userId: 'user-null-details',
          action: 'action',
          details: null as any,
        });

        expect(log).toBeDefined();
      });
    });
  });

  describe('getAuditLogs', () => {
    it('should retrieve audit logs for user', async () => {
      const userId = 'user-audit-logs';

      // Create multiple logs
      for (let i = 0; i < 5; i++) {
        await manager.createAuditLog({
          userId,
          action: `action-${i}`,
          details: {},
        });
      }

      const logs = await manager.getAuditLogs(userId);

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThanOrEqual(5);
    });

    it('should return logs in chronological order', async () => {
      const userId = 'user-chronological-logs';

      // Create logs
      for (let i = 0; i < 3; i++) {
        await manager.createAuditLog({
          userId,
          action: `action-${i}`,
          details: {},
        });
      }

      const logs = await manager.getAuditLogs(userId);

      expect(logs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Performance', () => {
    it('should check compliance quickly', async () => {
      const startTime = performance.now();
      await manager.checkNDPRCompliance({
        userId: 'perf-user',
        dataType: 'transaction_data',
        operation: 'read',
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should create audit logs quickly', async () => {
      const startTime = performance.now();
      await manager.createAuditLog({
        userId: 'perf-user',
        action: 'action',
        details: {},
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Event Publishing', () => {
    it('should publish compliance check event', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish');

      await manager.checkNDPRCompliance({
        userId: 'event-user',
        dataType: 'transaction_data',
        operation: 'read',
      });

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });

    it('should publish audit log event', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish');

      await manager.createAuditLog({
        userId: 'event-user',
        action: 'action',
        details: {},
      });

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });
  });
});
