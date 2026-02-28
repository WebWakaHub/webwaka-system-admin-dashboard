/**
 * FinancialReporter Unit Tests
 */

import { FinancialReporter } from '../../../src/economic-engine/components/FinancialReporter';

describe('FinancialReporter', () => {
  let reporter: FinancialReporter;

  beforeEach(() => {
    reporter = new FinancialReporter();
  });

  describe('generateReport', () => {
    it('should generate a daily report', () => {
      const transactions = [
        { amount: 1000, commission: 100, creatorId: 'creator1', level: 1 },
        { amount: 2000, commission: 200, creatorId: 'creator2', level: 2 },
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const report = reporter.generateReport('tenant1', 'daily', startDate, endDate, transactions);

      expect(report).toBeDefined();
      expect(report.reportType).toBe('daily');
      expect(report.tenantId).toBe('tenant1');
      expect(report.totalRevenue).toBe(3000);
      expect(report.totalCommissions).toBe(300);
      expect(report.totalTransactions).toBe(2);
      expect(report.averageTransactionAmount).toBe(1500);
    });

    it('should calculate top performers correctly', () => {
      const transactions = [
        { amount: 5000, commission: 500, creatorId: 'creator1', level: 1 },
        { amount: 3000, commission: 300, creatorId: 'creator2', level: 2 },
        { amount: 2000, commission: 200, creatorId: 'creator1', level: 1 },
      ];

      const report = reporter.generateReport(
        'tenant1',
        'monthly',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        transactions
      );

      expect(report.topPerformers).toBeDefined();
      expect(report.topPerformers.length).toBeGreaterThan(0);
      expect(report.topPerformers[0].participantId).toBe('creator1');
      expect(report.topPerformers[0].earnings).toBe(7000);
    });

    it('should calculate revenue by level correctly', () => {
      const transactions = [
        { amount: 1000, commission: 100, creatorId: 'creator1', level: 1 },
        { amount: 2000, commission: 200, creatorId: 'creator2', level: 2 },
        { amount: 1500, commission: 150, creatorId: 'creator3', level: 1 },
      ];

      const report = reporter.generateReport(
        'tenant1',
        'monthly',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        transactions
      );

      expect(report.revenueByLevel[1]).toBe(2500);
      expect(report.revenueByLevel[2]).toBe(2000);
    });

    it('should emit report-generated event', (done) => {
      const transactions = [{ amount: 1000, commission: 100, creatorId: 'creator1', level: 1 }];

      reporter.on('report-generated', (report) => {
        expect(report).toBeDefined();
        done();
      });

      reporter.generateReport(
        'tenant1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );
    });
  });

  describe('getReport', () => {
    it('should retrieve a generated report', () => {
      const transactions = [{ amount: 1000, commission: 100, creatorId: 'creator1', level: 1 }];

      const generatedReport = reporter.generateReport(
        'tenant1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );

      const retrievedReport = reporter.getReport(generatedReport.reportId);

      expect(retrievedReport).toBeDefined();
      expect(retrievedReport?.reportId).toBe(generatedReport.reportId);
    });

    it('should return undefined for non-existent report', () => {
      const report = reporter.getReport('non-existent');
      expect(report).toBeUndefined();
    });
  });

  describe('getReportsByTenant', () => {
    it('should retrieve all reports for a tenant', () => {
      const transactions = [{ amount: 1000, commission: 100, creatorId: 'creator1', level: 1 }];

      reporter.generateReport(
        'tenant1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );

      reporter.generateReport(
        'tenant1',
        'weekly',
        new Date('2024-01-01'),
        new Date('2024-01-08'),
        transactions
      );

      reporter.generateReport(
        'tenant2',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );

      const tenant1Reports = reporter.getReportsByTenant('tenant1');
      expect(tenant1Reports.length).toBe(2);
      expect(tenant1Reports.every(r => r.tenantId === 'tenant1')).toBe(true);
    });
  });

  describe('getParticipantSummary', () => {
    it('should generate participant financial summary', () => {
      const transactions = [
        { amount: 1000, commission: 100, creatorId: 'creator1', aggregatorId: 'agg1', level: 1 },
        { amount: 2000, commission: 200, creatorId: 'creator1', aggregatorId: 'agg1', level: 2 },
      ];

      const summary = reporter.getParticipantSummary('creator1', 'tenant1', transactions);

      expect(summary).toBeDefined();
      expect(summary.participantId).toBe('creator1');
      expect(summary.totalEarnings).toBe(3000);
      expect(summary.totalCommissions).toBe(300);
      expect(summary.totalTransactions).toBe(2);
    });

    it('should calculate average commission per transaction', () => {
      const transactions = [
        { amount: 1000, commission: 100, creatorId: 'creator1', level: 1 },
        { amount: 2000, commission: 200, creatorId: 'creator1', level: 2 },
      ];

      const summary = reporter.getParticipantSummary('creator1', 'tenant1', transactions);

      expect(summary.averageCommissionPerTransaction).toBe(150);
    });
  });

  describe('exportReportAsJSON', () => {
    it('should export report as JSON string', () => {
      const transactions = [{ amount: 1000, commission: 100, creatorId: 'creator1', level: 1 }];

      const generatedReport = reporter.generateReport(
        'tenant1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );

      const json = reporter.exportReportAsJSON(generatedReport.reportId);

      expect(json).toBeDefined();
      expect(typeof json).toBe('string');

      const parsed = JSON.parse(json);
      expect(parsed.reportId).toBe(generatedReport.reportId);
    });

    it('should throw error for non-existent report', () => {
      expect(() => reporter.exportReportAsJSON('non-existent')).toThrow();
    });
  });

  describe('exportReportAsCSV', () => {
    it('should export report as CSV string', () => {
      const transactions = [{ amount: 1000, commission: 100, creatorId: 'creator1', level: 1 }];

      const generatedReport = reporter.generateReport(
        'tenant1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );

      const csv = reporter.exportReportAsCSV(generatedReport.reportId);

      expect(csv).toBeDefined();
      expect(typeof csv).toBe('string');
      expect(csv).toContain('Report ID');
    });
  });

  describe('clearReports', () => {
    it('should clear all reports', (done) => {
      const transactions = [{ amount: 1000, commission: 100, creatorId: 'creator1', level: 1 }];

      reporter.generateReport(
        'tenant1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );

      reporter.on('reports-cleared', () => {
        const allReports = reporter.getAllReports();
        expect(allReports.length).toBe(0);
        done();
      });

      reporter.clearReports();
    });
  });

  describe('getAllReports', () => {
    it('should return all generated reports', () => {
      const transactions = [{ amount: 1000, commission: 100, creatorId: 'creator1', level: 1 }];

      reporter.generateReport(
        'tenant1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        transactions
      );

      reporter.generateReport(
        'tenant2',
        'weekly',
        new Date('2024-01-01'),
        new Date('2024-01-08'),
        transactions
      );

      const allReports = reporter.getAllReports();
      expect(allReports.length).toBe(2);
    });
  });
});
