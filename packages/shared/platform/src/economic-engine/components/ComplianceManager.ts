/**
 * Compliance Manager Component
 * Handles compliance checks and regulatory requirements
 */

import { EventEmitter } from 'events';

export interface ComplianceRule {
  ruleId: string;
  name: string;
  description: string;
  jurisdiction: string;
  enabled: boolean;
  checkFn: (transaction: any) => boolean;
}

export interface ComplianceCheck {
  checkId: string;
  transactionId: string;
  ruleId: string;
  passed: boolean;
  timestamp: Date;
  details?: string;
}

export interface TaxCalculation {
  transactionId: string;
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  jurisdiction: string;
  calculatedAt: Date;
}

export class ComplianceManager extends EventEmitter {
  private rules: Map<string, ComplianceRule> = new Map();
  private checks: Map<string, ComplianceCheck> = new Map();
  private taxCalculations: Map<string, TaxCalculation> = new Map();
  private jurisdiction: string = 'NG'; // Nigeria-First

  constructor(jurisdiction?: string) {
    super();
    if (jurisdiction) {
      this.jurisdiction = jurisdiction;
    }
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Nigerian-First compliance rules
    this.addRule({
      ruleId: 'rule_ndpr_001',
      name: 'NDPR Data Protection',
      description: 'Ensure compliance with Nigerian Data Protection Regulation',
      jurisdiction: 'NG',
      enabled: true,
      checkFn: (transaction) => {
        // Check if transaction has required data protection fields
        return !!transaction.userId && !!transaction.consentTimestamp;
      },
    });

    this.addRule({
      ruleId: 'rule_cbn_001',
      name: 'CBN Transaction Limit',
      description: 'Ensure transaction amounts comply with CBN limits',
      jurisdiction: 'NG',
      enabled: true,
      checkFn: (transaction) => {
        // CBN daily transaction limit
        return transaction.amount <= 5000000; // 5M NGN limit
      },
    });

    this.addRule({
      ruleId: 'rule_aml_001',
      name: 'AML Screening',
      description: 'Screen transactions for anti-money laundering compliance',
      jurisdiction: 'NG',
      enabled: true,
      checkFn: (transaction) => {
        // Check if participant is not on AML watchlist
        return !transaction.flaggedForAML;
      },
    });

    this.addRule({
      ruleId: 'rule_kyc_001',
      name: 'KYC Verification',
      description: 'Ensure KYC verification is completed',
      jurisdiction: 'NG',
      enabled: true,
      checkFn: (transaction) => {
        // Check if participant has completed KYC
        return transaction.kycStatus === 'verified';
      },
    });

    this.addRule({
      ruleId: 'rule_tax_001',
      name: 'Tax Withholding',
      description: 'Ensure proper tax withholding on transactions',
      jurisdiction: 'NG',
      enabled: true,
      checkFn: (transaction) => {
        // Check if tax has been calculated and withheld
        return transaction.taxWithheld !== undefined && transaction.taxWithheld >= 0;
      },
    });
  }

  public addRule(rule: ComplianceRule): void {
    this.rules.set(rule.ruleId, rule);
    this.emit('rule-added', rule);
  }

  public getRule(ruleId: string): ComplianceRule | undefined {
    return this.rules.get(ruleId);
  }

  public getAllRules(): ComplianceRule[] {
    return Array.from(this.rules.values());
  }

  public getEnabledRules(): ComplianceRule[] {
    return Array.from(this.rules.values()).filter(r => r.enabled);
  }

  public enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      this.emit('rule-enabled', rule);
    }
  }

  public disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      this.emit('rule-disabled', rule);
    }
  }

  public performComplianceCheck(transaction: any): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const enabledRules = this.getEnabledRules();

    enabledRules.forEach(rule => {
      const checkId = `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passed = rule.checkFn(transaction);

      const check: ComplianceCheck = {
        checkId,
        transactionId: transaction.transactionId,
        ruleId: rule.ruleId,
        passed,
        timestamp: new Date(),
        details: passed ? 'Passed' : `Failed: ${rule.name}`,
      };

      this.checks.set(checkId, check);
      checks.push(check);

      if (!passed) {
        this.emit('compliance-check-failed', check);
      }
    });

    return checks;
  }

  public getComplianceCheck(checkId: string): ComplianceCheck | undefined {
    return this.checks.get(checkId);
  }

  public getComplianceChecksByTransaction(transactionId: string): ComplianceCheck[] {
    return Array.from(this.checks.values()).filter(c => c.transactionId === transactionId);
  }

  public isTransactionCompliant(transactionId: string): boolean {
    const checks = this.getComplianceChecksByTransaction(transactionId);
    return checks.length > 0 && checks.every(c => c.passed);
  }

  public calculateTax(transactionId: string, grossAmount: number, taxRate: number = 0.1): TaxCalculation {
    const taxAmount = grossAmount * taxRate;
    const netAmount = grossAmount - taxAmount;

    const calculation: TaxCalculation = {
      transactionId,
      grossAmount,
      taxRate,
      taxAmount,
      netAmount,
      jurisdiction: this.jurisdiction,
      calculatedAt: new Date(),
    };

    this.taxCalculations.set(transactionId, calculation);
    this.emit('tax-calculated', calculation);

    return calculation;
  }

  public getTaxCalculation(transactionId: string): TaxCalculation | undefined {
    return this.taxCalculations.get(transactionId);
  }

  public getJurisdiction(): string {
    return this.jurisdiction;
  }

  public setJurisdiction(jurisdiction: string): void {
    this.jurisdiction = jurisdiction;
    this.emit('jurisdiction-changed', jurisdiction);
  }

  public getAllChecks(): ComplianceCheck[] {
    return Array.from(this.checks.values());
  }

  public getAllTaxCalculations(): TaxCalculation[] {
    return Array.from(this.taxCalculations.values());
  }

  public getComplianceReport(): {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    complianceRate: number;
    totalTaxCalculated: number;
  } {
    const checks = Array.from(this.checks.values());
    const passedChecks = checks.filter(c => c.passed).length;
    const failedChecks = checks.filter(c => !c.passed).length;
    const complianceRate = checks.length > 0 ? (passedChecks / checks.length) * 100 : 0;
    const totalTaxCalculated = Array.from(this.taxCalculations.values()).reduce(
      (sum, t) => sum + t.taxAmount,
      0
    );

    return {
      totalChecks: checks.length,
      passedChecks,
      failedChecks,
      complianceRate,
      totalTaxCalculated,
    };
  }

  public clearChecks(): void {
    this.checks.clear();
    this.emit('checks-cleared');
  }

  public clearTaxCalculations(): void {
    this.taxCalculations.clear();
    this.emit('tax-calculations-cleared');
  }
}
