import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'ndpr' | 'cbn' | 'aml_kyc' | 'nigerian_law' | 'custom';
  conditions: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}

export interface ComplianceViolation {
  id: string;
  contractId: string;
  ruleId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution: string;
}

export class ComplianceManager extends EventEmitter {
  private rules: Map<string, ComplianceRule> = new Map();
  private violations: Map<string, ComplianceViolation> = new Map();
  private contractViolations: Map<string, ComplianceViolation[]> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default compliance rules
   */
  private initializeDefaultRules(): void {
    // NDPR Rules
    this.addRule({
      id: 'ndpr-001',
      name: 'Data Minimization',
      description: 'Ensure only necessary data is collected',
      ruleType: 'ndpr',
      conditions: { maxDataFields: 10 },
      severity: 'high',
      isActive: true
    });

    // CBN Rules
    this.addRule({
      id: 'cbn-001',
      name: 'Transaction Limit',
      description: 'Enforce CBN transaction limits',
      ruleType: 'cbn',
      conditions: { maxTransactionAmount: 10000000 },
      severity: 'critical',
      isActive: true
    });

    // AML/KYC Rules
    this.addRule({
      id: 'aml-001',
      name: 'Party Verification',
      description: 'Verify all contract parties',
      ruleType: 'aml_kyc',
      conditions: { requireVerification: true },
      severity: 'critical',
      isActive: true
    });

    // Nigerian Law Rules
    this.addRule({
      id: 'ng-law-001',
      name: 'Contract Enforceability',
      description: 'Ensure contract is enforceable under Nigerian law',
      ruleType: 'nigerian_law',
      conditions: { requireLegalReview: true },
      severity: 'high',
      isActive: true
    });
  }

  /**
   * Add compliance rule
   */
  async addRule(rule: Partial<ComplianceRule>): Promise<ComplianceRule> {
    const newRule: ComplianceRule = {
      id: rule.id || uuidv4(),
      name: rule.name || '',
      description: rule.description || '',
      ruleType: rule.ruleType || 'custom',
      conditions: rule.conditions || {},
      severity: rule.severity || 'medium',
      isActive: rule.isActive !== false
    };

    this.rules.set(newRule.id, newRule);
    this.emit('rule:added', newRule);

    return newRule;
  }

  /**
   * Get rule
   */
  async getRule(ruleId: string): Promise<ComplianceRule | null> {
    return this.rules.get(ruleId) || null;
  }

  /**
   * List rules
   */
  async listRules(ruleType?: string): Promise<ComplianceRule[]> {
    let rules = Array.from(this.rules.values()).filter(r => r.isActive);
    if (ruleType) {
      rules = rules.filter(r => r.ruleType === ruleType);
    }
    return rules;
  }

  /**
   * Check contract compliance
   */
  async checkContractCompliance(
    contractId: string,
    contract: any
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const rules = await this.listRules();

    for (const rule of rules) {
      const isViolated = this.evaluateRule(rule, contract);
      if (isViolated) {
        const violation: ComplianceViolation = {
          id: uuidv4(),
          contractId,
          ruleId: rule.id,
          violationType: rule.ruleType,
          severity: rule.severity,
          description: rule.description,
          detectedAt: new Date(),
          resolution: ''
        };

        this.violations.set(violation.id, violation);
        const contractViolations = this.contractViolations.get(contractId) || [];
        contractViolations.push(violation);
        this.contractViolations.set(contractId, contractViolations);

        violations.push(violation);
        this.emit('violation:detected', violation);
      }
    }

    return violations;
  }

  /**
   * Get contract violations
   */
  async getContractViolations(contractId: string): Promise<ComplianceViolation[]> {
    return this.contractViolations.get(contractId) || [];
  }

  /**
   * Resolve violation
   */
  async resolveViolation(
    violationId: string,
    resolution: string
  ): Promise<ComplianceViolation> {
    const violation = this.violations.get(violationId);
    if (!violation) {
      throw new Error('Violation not found');
    }

    violation.resolvedAt = new Date();
    violation.resolution = resolution;

    this.violations.set(violationId, violation);
    this.emit('violation:resolved', violation);

    return violation;
  }

  /**
   * Verify party compliance
   */
  async verifyPartyCompliance(party: any): Promise<{
    isCompliant: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];

    // Check if party has required KYC information
    if (!party.email || !party.phone || !party.name) {
      violations.push('Missing required party information');
    }

    // Check if party is verified
    if (!party.verified) {
      violations.push('Party not verified');
    }

    return {
      isCompliant: violations.length === 0,
      violations
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(contractId: string): Promise<{
    contractId: string;
    totalViolations: number;
    criticalViolations: number;
    highViolations: number;
    mediumViolations: number;
    lowViolations: number;
    complianceStatus: string;
    violations: ComplianceViolation[];
  }> {
    const violations = await this.getContractViolations(contractId);

    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    const mediumViolations = violations.filter(v => v.severity === 'medium').length;
    const lowViolations = violations.filter(v => v.severity === 'low').length;

    let complianceStatus = 'compliant';
    if (criticalViolations > 0) {
      complianceStatus = 'critical';
    } else if (highViolations > 0) {
      complianceStatus = 'non_compliant';
    } else if (mediumViolations > 0) {
      complianceStatus = 'warning';
    }

    return {
      contractId,
      totalViolations: violations.length,
      criticalViolations,
      highViolations,
      mediumViolations,
      lowViolations,
      complianceStatus,
      violations
    };
  }

  /**
   * Evaluate rule against contract
   */
  private evaluateRule(rule: ComplianceRule, contract: any): boolean {
    switch (rule.ruleType) {
      case 'ndpr':
        return this.evaluateNDPRRule(rule, contract);
      case 'cbn':
        return this.evaluateCBNRule(rule, contract);
      case 'aml_kyc':
        return this.evaluateAMLKYCRule(rule, contract);
      case 'nigerian_law':
        return this.evaluateNigerianLawRule(rule, contract);
      default:
        return false;
    }
  }

  /**
   * Evaluate NDPR rule
   */
  private evaluateNDPRRule(rule: ComplianceRule, contract: any): boolean {
    if (rule.name === 'Data Minimization') {
      const dataFields = Object.keys(contract).length;
      return dataFields > (rule.conditions.maxDataFields || 10);
    }
    return false;
  }

  /**
   * Evaluate CBN rule
   */
  private evaluateCBNRule(rule: ComplianceRule, contract: any): boolean {
    if (rule.name === 'Transaction Limit') {
      const amount = contract.terms?.value || 0;
      return amount > (rule.conditions.maxTransactionAmount || 10000000);
    }
    return false;
  }

  /**
   * Evaluate AML/KYC rule
   */
  private evaluateAMLKYCRule(rule: ComplianceRule, contract: any): boolean {
    if (rule.name === 'Party Verification') {
      const parties = contract.parties || [];
      return parties.some((p: any) => !p.verified);
    }
    return false;
  }

  /**
   * Evaluate Nigerian Law rule
   */
  private evaluateNigerianLawRule(rule: ComplianceRule, contract: any): boolean {
    if (rule.name === 'Contract Enforceability') {
      return !contract.metadata?.legalReviewCompleted;
    }
    return false;
  }
}
