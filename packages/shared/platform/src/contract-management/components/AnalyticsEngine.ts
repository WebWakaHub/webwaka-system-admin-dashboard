import { EventEmitter } from 'events';

export interface ContractAnalytics {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  expiredContracts: number;
  contractsByStatus: Record<string, number>;
  contractsByParty: Record<string, number>;
  totalContractValue: number;
  averageContractValue: number;
  contractDuration: {
    average: number;
    min: number;
    max: number;
  };
  complianceRate: number;
  renewalRate: number;
}

export interface PerformanceReport {
  period: string;
  startDate: Date;
  endDate: Date;
  metrics: {
    contractsCreated: number;
    contractsSigned: number;
    contractsCompleted: number;
    contractsExpired: number;
    averageSigningTime: number;
    averageExecutionTime: number;
    complianceViolations: number;
  };
}

export interface ComplianceReport {
  period: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  complianceRate: number;
  violations: Array<{
    contractId: string;
    violationType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
  }>;
}

export class AnalyticsEngine extends EventEmitter {
  private contracts: Map<string, any> = new Map();
  private complianceChecks: Map<string, any> = new Map();

  constructor() {
    super();
  }

  /**
   * Register contract for analytics
   */
  registerContract(contractId: string, contract: any): void {
    this.contracts.set(contractId, contract);
  }

  /**
   * Register compliance check for analytics
   */
  registerComplianceCheck(checkId: string, check: any): void {
    this.complianceChecks.set(checkId, check);
  }

  /**
   * Get contract analytics
   */
  async getContractAnalytics(): Promise<ContractAnalytics> {
    const contracts = Array.from(this.contracts.values());
    
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(
      c => c.status === 'executed' || c.status === 'signed'
    ).length;
    const completedContracts = contracts.filter(
      c => c.status === 'completed'
    ).length;
    const expiredContracts = contracts.filter(
      c => c.status === 'expired'
    ).length;

    const contractsByStatus: Record<string, number> = {};
    const contractsByParty: Record<string, number> = {};
    let totalContractValue = 0;

    for (const contract of contracts) {
      contractsByStatus[contract.status] = (contractsByStatus[contract.status] || 0) + 1;
      totalContractValue += contract.terms?.value || 0;

      for (const party of contract.parties || []) {
        contractsByParty[party.name] = (contractsByParty[party.name] || 0) + 1;
      }
    }

    const averageContractValue = totalContracts > 0 ? totalContractValue / totalContracts : 0;

    return {
      totalContracts,
      activeContracts,
      completedContracts,
      expiredContracts,
      contractsByStatus,
      contractsByParty,
      totalContractValue,
      averageContractValue,
      contractDuration: this.calculateContractDuration(contracts),
      complianceRate: this.calculateComplianceRate(),
      renewalRate: this.calculateRenewalRate()
    };
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceReport> {
    const contracts = Array.from(this.contracts.values()).filter(
      c => c.createdAt >= startDate && c.createdAt <= endDate
    );

    const contractsCreated = contracts.length;
    const contractsSigned = contracts.filter(c => c.status === 'signed').length;
    const contractsCompleted = contracts.filter(c => c.status === 'completed').length;
    const contractsExpired = contracts.filter(c => c.status === 'expired').length;

    return {
      period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      startDate,
      endDate,
      metrics: {
        contractsCreated,
        contractsSigned,
        contractsCompleted,
        contractsExpired,
        averageSigningTime: this.calculateAverageSigningTime(contracts),
        averageExecutionTime: this.calculateAverageExecutionTime(contracts),
        complianceViolations: this.calculateComplianceViolations()
      }
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const checks = Array.from(this.complianceChecks.values()).filter(
      c => c.timestamp >= startDate && c.timestamp <= endDate
    );

    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.status === 'passed').length;
    const failedChecks = checks.filter(c => c.status === 'failed').length;
    const complianceRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    const violations = checks
      .filter(c => c.status === 'failed')
      .map(c => ({
        contractId: c.contractId,
        violationType: c.checkType,
        severity: this.calculateViolationSeverity(c),
        timestamp: c.timestamp
      }));

    return {
      period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      totalChecks,
      passedChecks,
      failedChecks,
      complianceRate,
      violations
    };
  }

  /**
   * Export analytics as CSV
   */
  async exportAnalyticsAsCSV(): Promise<string> {
    const analytics = await this.getContractAnalytics();
    
    let csv = 'Metric,Value\n';
    csv += `Total Contracts,${analytics.totalContracts}\n`;
    csv += `Active Contracts,${analytics.activeContracts}\n`;
    csv += `Completed Contracts,${analytics.completedContracts}\n`;
    csv += `Expired Contracts,${analytics.expiredContracts}\n`;
    csv += `Total Contract Value,${analytics.totalContractValue}\n`;
    csv += `Average Contract Value,${analytics.averageContractValue}\n`;
    csv += `Compliance Rate,${analytics.complianceRate}%\n`;
    csv += `Renewal Rate,${analytics.renewalRate}%\n`;

    return csv;
  }

  /**
   * Export analytics as JSON
   */
  async exportAnalyticsAsJSON(): Promise<string> {
    const analytics = await this.getContractAnalytics();
    return JSON.stringify(analytics, null, 2);
  }

  /**
   * Calculate contract duration
   */
  private calculateContractDuration(contracts: any[]): {
    average: number;
    min: number;
    max: number;
  } {
    if (contracts.length === 0) {
      return { average: 0, min: 0, max: 0 };
    }

    const durations = contracts
      .filter(c => c.terms?.startDate && c.terms?.endDate)
      .map(c => {
        const start = new Date(c.terms.startDate).getTime();
        const end = new Date(c.terms.endDate).getTime();
        return (end - start) / (1000 * 60 * 60 * 24); // days
      });

    if (durations.length === 0) {
      return { average: 0, min: 0, max: 0 };
    }

    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return { average, min, max };
  }

  /**
   * Calculate compliance rate
   */
  private calculateComplianceRate(): number {
    const checks = Array.from(this.complianceChecks.values());
    if (checks.length === 0) return 100;

    const passedChecks = checks.filter(c => c.status === 'passed').length;
    return (passedChecks / checks.length) * 100;
  }

  /**
   * Calculate renewal rate
   */
  private calculateRenewalRate(): number {
    const contracts = Array.from(this.contracts.values());
    if (contracts.length === 0) return 0;

    const renewedContracts = contracts.filter(
      c => c.metadata?.renewed === true
    ).length;
    return (renewedContracts / contracts.length) * 100;
  }

  /**
   * Calculate average signing time
   */
  private calculateAverageSigningTime(contracts: any[]): number {
    const signingTimes = contracts
      .filter(c => c.createdAt && c.signedAt)
      .map(c => {
        const created = new Date(c.createdAt).getTime();
        const signed = new Date(c.signedAt).getTime();
        return (signed - created) / (1000 * 60 * 60); // hours
      });

    if (signingTimes.length === 0) return 0;
    return signingTimes.reduce((a, b) => a + b, 0) / signingTimes.length;
  }

  /**
   * Calculate average execution time
   */
  private calculateAverageExecutionTime(contracts: any[]): number {
    const executionTimes = contracts
      .filter(c => c.signedAt && c.metadata?.executedAt)
      .map(c => {
        const signed = new Date(c.signedAt).getTime();
        const executed = new Date(c.metadata.executedAt).getTime();
        return (executed - signed) / (1000 * 60 * 60); // hours
      });

    if (executionTimes.length === 0) return 0;
    return executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
  }

  /**
   * Calculate compliance violations
   */
  private calculateComplianceViolations(): number {
    const checks = Array.from(this.complianceChecks.values());
    return checks.filter(c => c.status === 'failed').length;
  }

  /**
   * Calculate violation severity
   */
  private calculateViolationSeverity(
    check: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (check.details?.severity) {
      return check.details.severity;
    }
    return 'medium';
  }
}
