/**
 * Financial Reporter Component
 * Generates financial reports and analytics
 */

import { EventEmitter } from 'events';

export interface FinancialReport {
  reportId: string;
  tenantId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalCommissions: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  topPerformers: Array<{ participantId: string; earnings: number }>;
  revenueByLevel: { [key: number]: number };
  generatedAt: Date;
}

export interface ParticipantFinancialSummary {
  participantId: string;
  tenantId: string;
  totalEarnings: number;
  totalCommissions: number;
  totalTransactions: number;
  averageCommissionPerTransaction: number;
  revenueByLevel: { [key: number]: number };
  lastUpdated: Date;
}

export class FinancialReporter extends EventEmitter {
  private reports: Map<string, FinancialReport> = new Map();
  private participantSummaries: Map<string, ParticipantFinancialSummary> = new Map();

  public generateReport(
    tenantId: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual',
    startDate: Date,
    endDate: Date,
    transactions: any[]
  ): FinancialReport {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCommissions = transactions.reduce((sum, t) => sum + (t.commission || 0), 0);
    const totalTransactions = transactions.length;
    const averageTransactionAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const topPerformers = this.calculateTopPerformers(transactions, 10);
    const revenueByLevel = this.calculateRevenueByLevel(transactions);

    const report: FinancialReport = {
      reportId,
      tenantId,
      reportType,
      startDate,
      endDate,
      totalRevenue,
      totalCommissions,
      totalTransactions,
      averageTransactionAmount,
      topPerformers,
      revenueByLevel,
      generatedAt: new Date(),
    };

    this.reports.set(reportId, report);
    this.emit('report-generated', report);

    return report;
  }

  public getReport(reportId: string): FinancialReport | undefined {
    return this.reports.get(reportId);
  }

  public getReportsByTenant(tenantId: string): FinancialReport[] {
    return Array.from(this.reports.values()).filter(r => r.tenantId === tenantId);
  }

  public getParticipantSummary(
    participantId: string,
    tenantId: string,
    transactions: any[]
  ): ParticipantFinancialSummary {
    const key = `${participantId}_${tenantId}`;
    const existingSummary = this.participantSummaries.get(key);

    const participantTransactions = transactions.filter(
      t => t.creatorId === participantId || t.aggregatorId === participantId
    );

    const totalEarnings = participantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCommissions = participantTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);
    const totalTransactions = participantTransactions.length;
    const averageCommissionPerTransaction = totalTransactions > 0 ? totalCommissions / totalTransactions : 0;
    const revenueByLevel = this.calculateRevenueByLevel(participantTransactions);

    const summary: ParticipantFinancialSummary = {
      participantId,
      tenantId,
      totalEarnings,
      totalCommissions,
      totalTransactions,
      averageCommissionPerTransaction,
      revenueByLevel,
      lastUpdated: new Date(),
    };

    this.participantSummaries.set(key, summary);
    return summary;
  }

  public getParticipantSummaryByKey(key: string): ParticipantFinancialSummary | undefined {
    return this.participantSummaries.get(key);
  }

  private calculateTopPerformers(
    transactions: any[],
    limit: number
  ): Array<{ participantId: string; earnings: number }> {
    const performerMap = new Map<string, number>();

    transactions.forEach(t => {
      if (t.creatorId) {
        performerMap.set(t.creatorId, (performerMap.get(t.creatorId) || 0) + t.amount);
      }
    });

    return Array.from(performerMap.entries())
      .map(([participantId, earnings]) => ({ participantId, earnings }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, limit);
  }

  private calculateRevenueByLevel(transactions: any[]): { [key: number]: number } {
    const revenueByLevel: { [key: number]: number } = {};

    transactions.forEach(t => {
      if (t.level) {
        revenueByLevel[t.level] = (revenueByLevel[t.level] || 0) + t.amount;
      }
    });

    return revenueByLevel;
  }

  public exportReportAsJSON(reportId: string): string {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }
    return JSON.stringify(report, null, 2);
  }

  public exportReportAsCSV(reportId: string): string {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    const headers = [
      'Report ID',
      'Tenant ID',
      'Report Type',
      'Start Date',
      'End Date',
      'Total Revenue',
      'Total Commissions',
      'Total Transactions',
      'Average Transaction Amount',
      'Generated At',
    ];

    const row = [
      report.reportId,
      report.tenantId,
      report.reportType,
      report.startDate.toISOString(),
      report.endDate.toISOString(),
      report.totalRevenue,
      report.totalCommissions,
      report.totalTransactions,
      report.averageTransactionAmount,
      report.generatedAt.toISOString(),
    ];

    return [headers.join(','), row.join(',')].join('\n');
  }

  public getAllReports(): FinancialReport[] {
    return Array.from(this.reports.values());
  }

  public getAllParticipantSummaries(): ParticipantFinancialSummary[] {
    return Array.from(this.participantSummaries.values());
  }

  public clearReports(): void {
    this.reports.clear();
    this.emit('reports-cleared');
  }

  public clearParticipantSummaries(): void {
    this.participantSummaries.clear();
    this.emit('summaries-cleared');
  }
}
