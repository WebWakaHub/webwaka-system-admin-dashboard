/**
 * ComplianceManager Unit Tests
 */

import { ComplianceManager } from '../../../src/economic-engine/components/ComplianceManager';

describe('ComplianceManager', () => {
  let manager: ComplianceManager;

  beforeEach(() => {
    manager = new ComplianceManager('NG');
  });

  describe('initialization', () => {
    it('should initialize with default jurisdiction', () => {
      expect(manager.getJurisdiction()).toBe('NG');
    });

    it('should initialize with default compliance rules', () => {
      const rules = manager.getAllRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should have NDPR rule enabled by default', () => {
      const rules = manager.getEnabledRules();
      const ndprRule = rules.find(r => r.ruleId === 'rule_ndpr_001');
      expect(ndprRule).toBeDefined();
    });
  });

  describe('addRule', () => {
    it('should add a custom compliance rule', () => {
      const customRule = {
        ruleId: 'rule_custom_001',
        name: 'Custom Rule',
        description: 'A custom compliance rule',
        jurisdiction: 'NG',
        enabled: true,
        checkFn: (transaction: any) => transaction.amount > 0,
      };

      manager.addRule(customRule);

      const rule = manager.getRule('rule_custom_001');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Custom Rule');
    });

    it('should emit rule-added event', (done) => {
      const customRule = {
        ruleId: 'rule_custom_001',
        name: 'Custom Rule',
        description: 'A custom compliance rule',
        jurisdiction: 'NG',
        enabled: true,
        checkFn: (transaction: any) => transaction.amount > 0,
      };

      manager.on('rule-added', (rule) => {
        expect(rule.ruleId).toBe('rule_custom_001');
        done();
      });

      manager.addRule(customRule);
    });
  });

  describe('enableRule and disableRule', () => {
    it('should enable a disabled rule', () => {
      manager.disableRule('rule_ndpr_001');
      manager.enableRule('rule_ndpr_001');

      const rule = manager.getRule('rule_ndpr_001');
      expect(rule?.enabled).toBe(true);
    });

    it('should disable an enabled rule', () => {
      manager.disableRule('rule_ndpr_001');

      const rule = manager.getRule('rule_ndpr_001');
      expect(rule?.enabled).toBe(false);
    });

    it('should emit rule-enabled event', (done) => {
      manager.disableRule('rule_ndpr_001');

      manager.on('rule-enabled', (rule) => {
        expect(rule.ruleId).toBe('rule_ndpr_001');
        done();
      });

      manager.enableRule('rule_ndpr_001');
    });

    it('should emit rule-disabled event', (done) => {
      manager.on('rule-disabled', (rule) => {
        expect(rule.ruleId).toBe('rule_ndpr_001');
        done();
      });

      manager.disableRule('rule_ndpr_001');
    });
  });

  describe('performComplianceCheck', () => {
    it('should perform compliance checks on transaction', () => {
      const transaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: new Date(),
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'verified',
        taxWithheld: 100000,
      };

      const checks = manager.performComplianceCheck(transaction);

      expect(checks.length).toBeGreaterThan(0);
      expect(checks.every(c => c.transactionId === 'txn_001')).toBe(true);
    });

    it('should mark checks as passed for compliant transaction', () => {
      const transaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: new Date(),
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'verified',
        taxWithheld: 100000,
      };

      const checks = manager.performComplianceCheck(transaction);

      expect(checks.every(c => c.passed)).toBe(true);
    });

    it('should mark checks as failed for non-compliant transaction', () => {
      const transaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: undefined,
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'unverified',
        taxWithheld: 100000,
      };

      const checks = manager.performComplianceCheck(transaction);

      expect(checks.some(c => !c.passed)).toBe(true);
    });

    it('should emit compliance-check-failed event', (done) => {
      const transaction = {
        transactionId: 'txn_001',
        amount: 10000000, // Exceeds CBN limit
        flaggedForAML: false,
        kycStatus: 'verified',
      };

      let eventFired = false;
      manager.on('compliance-check-failed', (check) => {
        if (!eventFired) {
          eventFired = true;
          expect(check).toBeDefined();
          done();
        }
      });

      manager.performComplianceCheck(transaction);
    });
  });

  describe('getComplianceChecksByTransaction', () => {
    it('should retrieve all checks for a transaction', () => {
      const transaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: new Date(),
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'verified',
        taxWithheld: 100000,
      };

      manager.performComplianceCheck(transaction);

      const checks = manager.getComplianceChecksByTransaction('txn_001');

      expect(checks.length).toBeGreaterThan(0);
      expect(checks.every(c => c.transactionId === 'txn_001')).toBe(true);
    });
  });

  describe('isTransactionCompliant', () => {
    it('should return true for compliant transaction', () => {
      const transaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: new Date(),
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'verified',
        taxWithheld: 100000,
      };

      manager.performComplianceCheck(transaction);

      const isCompliant = manager.isTransactionCompliant('txn_001');
      expect(isCompliant).toBe(true);
    });

    it('should return false for non-compliant transaction', () => {
      const transaction = {
        transactionId: 'txn_001',
        amount: 10000000, // Exceeds CBN limit
        flaggedForAML: false,
        kycStatus: 'verified',
      };

      manager.performComplianceCheck(transaction);

      const isCompliant = manager.isTransactionCompliant('txn_001');
      expect(isCompliant).toBe(false);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax on transaction', () => {
      const calculation = manager.calculateTax('txn_001', 100000, 0.1);

      expect(calculation).toBeDefined();
      expect(calculation.grossAmount).toBe(100000);
      expect(calculation.taxRate).toBe(0.1);
      expect(calculation.taxAmount).toBe(10000);
      expect(calculation.netAmount).toBe(90000);
    });

    it('should use default tax rate if not provided', () => {
      const calculation = manager.calculateTax('txn_001', 100000);

      expect(calculation.taxRate).toBe(0.1);
      expect(calculation.taxAmount).toBe(10000);
    });

    it('should emit tax-calculated event', (done) => {
      manager.on('tax-calculated', (calculation) => {
        expect(calculation.transactionId).toBe('txn_001');
        done();
      });

      manager.calculateTax('txn_001', 100000, 0.1);
    });

    it('should set jurisdiction in tax calculation', () => {
      const calculation = manager.calculateTax('txn_001', 100000, 0.1);

      expect(calculation.jurisdiction).toBe('NG');
    });
  });

  describe('getTaxCalculation', () => {
    it('should retrieve a tax calculation', () => {
      manager.calculateTax('txn_001', 100000, 0.1);

      const calculation = manager.getTaxCalculation('txn_001');

      expect(calculation).toBeDefined();
      expect(calculation?.transactionId).toBe('txn_001');
    });

    it('should return undefined for non-existent calculation', () => {
      const calculation = manager.getTaxCalculation('non-existent');
      expect(calculation).toBeUndefined();
    });
  });

  describe('jurisdiction management', () => {
    it('should get current jurisdiction', () => {
      expect(manager.getJurisdiction()).toBe('NG');
    });

    it('should set jurisdiction', () => {
      manager.setJurisdiction('US');

      expect(manager.getJurisdiction()).toBe('US');
    });

    it('should emit jurisdiction-changed event', (done) => {
      manager.on('jurisdiction-changed', (jurisdiction) => {
        expect(jurisdiction).toBe('US');
        done();
      });

      manager.setJurisdiction('US');
    });
  });

  describe('getComplianceReport', () => {
    it('should generate compliance report', () => {
      const transaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: new Date(),
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'verified',
        taxWithheld: 100000,
      };

      manager.performComplianceCheck(transaction);
      manager.calculateTax('txn_001', 100000, 0.1);

      const report = manager.getComplianceReport();

      expect(report).toBeDefined();
      expect(report.totalChecks).toBeGreaterThan(0);
      expect(report.complianceRate).toBeGreaterThanOrEqual(0);
      expect(report.totalTaxCalculated).toBe(10000);
    });

    it('should calculate compliance rate correctly', () => {
      const compliantTransaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: new Date(),
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'verified',
        taxWithheld: 100000,
      };

      manager.performComplianceCheck(compliantTransaction);

      const report = manager.getComplianceReport();

      expect(report.complianceRate).toBe(100);
    });
  });

  describe('clearChecks and clearTaxCalculations', () => {
    it('should clear all checks', (done) => {
      const transaction = {
        transactionId: 'txn_001',
        userId: 'user_001',
        consentTimestamp: new Date(),
        amount: 1000000,
        flaggedForAML: false,
        kycStatus: 'verified',
        taxWithheld: 100000,
      };

      manager.performComplianceCheck(transaction);

      manager.on('checks-cleared', () => {
        const checks = manager.getAllChecks();
        expect(checks.length).toBe(0);
        done();
      });

      manager.clearChecks();
    });

    it('should clear all tax calculations', (done) => {
      manager.calculateTax('txn_001', 100000, 0.1);

      manager.on('tax-calculations-cleared', () => {
        const calculations = manager.getAllTaxCalculations();
        expect(calculations.length).toBe(0);
        done();
      });

      manager.clearTaxCalculations();
    });
  });
});
