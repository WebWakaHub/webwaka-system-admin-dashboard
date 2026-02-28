import { NegotiationEngine } from '../../components/NegotiationEngine';
import { ExecutionEngine } from '../../components/ExecutionEngine';
import { MonitoringEngine } from '../../components/MonitoringEngine';
import { RenewalManager } from '../../components/RenewalManager';
import { AnalyticsEngine } from '../../components/AnalyticsEngine';
import { ComplianceManager } from '../../components/ComplianceManager';
import { NotificationService } from '../../components/NotificationService';

describe('NegotiationEngine', () => {
  let engine: NegotiationEngine;

  beforeEach(() => {
    engine = new NegotiationEngine();
  });

  it('should start negotiation session', async () => {
    const session = await engine.startSession('contract-1', ['user-1', 'user-2']);

    expect(session).toBeDefined();
    expect(session.contractId).toBe('contract-1');
    expect(session.status).toBe('active');
    expect(session.participants.length).toBe(2);
  });

  it('should propose change', async () => {
    const session = await engine.startSession('contract-1', ['user-1']);

    const change = await engine.proposeChange('contract-1', session.id, {
      changeType: 'modification',
      section: 'Terms',
      originalContent: 'Old',
      proposedContent: 'New',
      reason: 'Better terms'
    }, 'user-1');

    expect(change).toBeDefined();
    expect(change.status).toBe('proposed');
  });

  it('should accept change', async () => {
    const session = await engine.startSession('contract-1', ['user-1']);
    const change = await engine.proposeChange('contract-1', session.id, {
      changeType: 'modification',
      section: 'Terms',
      originalContent: 'Old',
      proposedContent: 'New'
    }, 'user-1');

    const accepted = await engine.acceptChange(change.id, 'user-1');

    expect(accepted.status).toBe('accepted');
    expect(accepted.resolvedAt).toBeDefined();
  });

  it('should reject change', async () => {
    const session = await engine.startSession('contract-1', ['user-1']);
    const change = await engine.proposeChange('contract-1', session.id, {
      changeType: 'modification',
      section: 'Terms',
      originalContent: 'Old',
      proposedContent: 'New'
    }, 'user-1');

    const rejected = await engine.rejectChange(change.id, 'user-1', 'Not acceptable');

    expect(rejected.status).toBe('rejected');
  });

  it('should add comment to change', async () => {
    const session = await engine.startSession('contract-1', ['user-1']);
    const change = await engine.proposeChange('contract-1', session.id, {
      changeType: 'modification',
      section: 'Terms',
      originalContent: 'Old',
      proposedContent: 'New'
    }, 'user-1');

    const updated = await engine.addComment(change.id, 'user-1', 'This looks good');

    expect(updated.comments.length).toBe(1);
    expect(updated.comments[0].text).toBe('This looks good');
  });
});

describe('ExecutionEngine', () => {
  let engine: ExecutionEngine;

  beforeEach(() => {
    engine = new ExecutionEngine();
  });

  it('should create digital signature', async () => {
    const sig = await engine.createSignature('contract-1', 'party-1', 'signature-data', '192.168.1.1', 'Mozilla/5.0');

    expect(sig).toBeDefined();
    expect(sig.contractId).toBe('contract-1');
    expect(sig.partyId).toBe('party-1');
    expect(sig.signatureHash).toBeDefined();
  });

  it('should verify signature', async () => {
    const sig = await engine.createSignature('contract-1', 'party-1', 'signature-data', '192.168.1.1', 'Mozilla/5.0');

    const isValid = await engine.verifySignature(sig.id, 'contract-1');

    expect(isValid).toBe(true);
  });

  it('should create execution record', async () => {
    const sig = await engine.createSignature('contract-1', 'party-1', 'sig-data', '192.168.1.1', 'Mozilla/5.0');

    const record = await engine.createExecutionRecord('contract-1', 'user-1', [sig]);

    expect(record).toBeDefined();
    expect(record.status).toBe('completed');
    expect(record.signatures.length).toBe(1);
  });

  it('should bulk sign contract', async () => {
    const sigs = [
      { partyId: 'party-1', signatureData: 'sig1', ipAddress: '192.168.1.1', userAgent: 'Mozilla' },
      { partyId: 'party-2', signatureData: 'sig2', ipAddress: '192.168.1.2', userAgent: 'Chrome' }
    ];

    const record = await engine.bulkSign('contract-1', sigs, 'user-1');

    expect(record.signatures.length).toBe(2);
  });
});

describe('MonitoringEngine', () => {
  let engine: MonitoringEngine;

  beforeEach(() => {
    engine = new MonitoringEngine();
  });

  it('should add milestone', async () => {
    const milestone = await engine.addMilestone('contract-1', {
      name: 'Phase 1 Complete',
      dueDate: new Date(),
      description: 'First phase completion'
    });

    expect(milestone).toBeDefined();
    expect(milestone.status).toBe('pending');
  });

  it('should update milestone status', async () => {
    const milestone = await engine.addMilestone('contract-1', {
      name: 'Phase 1',
      dueDate: new Date()
    });

    const updated = await engine.updateMilestoneStatus(milestone.id, 'completed', 'Done');

    expect(updated.status).toBe('completed');
    expect(updated.completedDate).toBeDefined();
  });

  it('should add compliance check', async () => {
    const check = await engine.addComplianceCheck('contract-1', {
      checkType: 'NDPR',
      status: 'passed',
      result: 'Compliant'
    });

    expect(check).toBeDefined();
    expect(check.status).toBe('passed');
  });

  it('should add performance metric', async () => {
    const metric = await engine.addPerformanceMetric('contract-1', {
      metricName: 'Delivery Time',
      targetValue: 100,
      actualValue: 95,
      unit: 'days'
    });

    expect(metric).toBeDefined();
    expect(metric.status).toBe('on_track');
  });

  it('should get monitoring summary', async () => {
    await engine.addMilestone('contract-1', { name: 'M1', dueDate: new Date() });
    await engine.addComplianceCheck('contract-1', { checkType: 'NDPR', status: 'passed', result: 'OK' });

    const summary = await engine.getMonitoringSummary('contract-1');

    expect(summary.milestones.length).toBe(1);
    expect(summary.complianceChecks.length).toBe(1);
  });
});

describe('RenewalManager', () => {
  let manager: RenewalManager;

  beforeEach(() => {
    manager = new RenewalManager();
  });

  it('should create renewal request', async () => {
    const request = await manager.createRenewalRequest('contract-1', 'user-1', { term: '2 years' });

    expect(request).toBeDefined();
    expect(request.status).toBe('pending');
  });

  it('should approve renewal request', async () => {
    const request = await manager.createRenewalRequest('contract-1', 'user-1', {});

    const approved = await manager.approveRenewalRequest(request.id, 'user-2');

    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('user-2');
  });

  it('should complete renewal', async () => {
    const request = await manager.createRenewalRequest('contract-1', 'user-1', {});
    await manager.approveRenewalRequest(request.id, 'user-2');

    const completed = await manager.completeRenewal(request.id);

    expect(completed.status).toBe('completed');
  });

  it('should send renewal notification', async () => {
    const notification = await manager.sendRenewalNotification('contract-1', 'user-1', 30);

    expect(notification).toBeDefined();
    expect(notification.daysUntilExpiration).toBe(30);
  });
});

describe('AnalyticsEngine', () => {
  let engine: AnalyticsEngine;

  beforeEach(() => {
    engine = new AnalyticsEngine();
  });

  it('should get contract analytics', async () => {
    engine.registerContract('c1', { status: 'executed', parties: [], createdAt: new Date() });
    engine.registerContract('c2', { status: 'completed', parties: [], createdAt: new Date() });

    const analytics = await engine.getContractAnalytics();

    expect(analytics.totalContracts).toBe(2);
    expect(analytics.activeContracts).toBe(1);
    expect(analytics.completedContracts).toBe(1);
  });

  it('should generate performance report', async () => {
    const now = new Date();
    engine.registerContract('c1', {
      createdAt: now,
      signedAt: new Date(now.getTime() + 3600000),
      status: 'signed'
    });

    const report = await engine.generatePerformanceReport(
      new Date(now.getTime() - 86400000),
      new Date(now.getTime() + 86400000)
    );

    expect(report).toBeDefined();
    expect(report.metrics.contractsCreated).toBe(1);
  });

  it('should export analytics as CSV', async () => {
    engine.registerContract('c1', { status: 'draft', parties: [] });

    const csv = await engine.exportAnalyticsAsCSV();

    expect(csv).toContain('Metric,Value');
    expect(csv).toContain('Total Contracts');
  });

  it('should export analytics as JSON', async () => {
    engine.registerContract('c1', { status: 'draft', parties: [] });

    const json = await engine.exportAnalyticsAsJSON();

    expect(json).toContain('totalContracts');
  });
});

describe('ComplianceManager', () => {
  let manager: ComplianceManager;

  beforeEach(() => {
    manager = new ComplianceManager();
  });

  it('should add compliance rule', async () => {
    const rule = await manager.addRule({
      name: 'Test Rule',
      description: 'Test',
      ruleType: 'custom',
      severity: 'high'
    });

    expect(rule).toBeDefined();
    expect(rule.isActive).toBe(true);
  });

  it('should list compliance rules', async () => {
    const rules = await manager.listRules();

    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0].isActive).toBe(true);
  });

  it('should check contract compliance', async () => {
    const violations = await manager.checkContractCompliance('contract-1', {
      parties: [{ verified: true }]
    });

    expect(Array.isArray(violations)).toBe(true);
  });

  it('should generate compliance report', async () => {
    const report = await manager.generateComplianceReport('contract-1');

    expect(report).toBeDefined();
    expect(report.contractId).toBe('contract-1');
    expect(report.totalViolations).toBeDefined();
  });

  it('should verify party compliance', async () => {
    const result = await manager.verifyPartyCompliance({
      email: 'test@test.com',
      phone: '1234567890',
      name: 'John Doe',
      verified: true
    });

    expect(result.isCompliant).toBe(true);
  });
});

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('should send notification', async () => {
    const notification = await service.sendNotification(
      'user-1',
      'contract_created',
      'New Contract',
      'A new contract has been created'
    );

    expect(notification).toBeDefined();
    expect(notification.read).toBe(false);
  });

  it('should mark notification as read', async () => {
    const notification = await service.sendNotification(
      'user-1',
      'contract_created',
      'New Contract',
      'Message'
    );

    const read = await service.markAsRead(notification.id);

    expect(read.read).toBe(true);
    expect(read.readAt).toBeDefined();
  });

  it('should get user notifications', async () => {
    await service.sendNotification('user-1', 'contract_created', 'Title', 'Message');
    await service.sendNotification('user-1', 'contract_signed', 'Title', 'Message');

    const result = await service.getUserNotifications('user-1');

    expect(result.notifications.length).toBe(2);
    expect(result.total).toBe(2);
  });

  it('should get unread count', async () => {
    await service.sendNotification('user-1', 'contract_created', 'Title', 'Message');
    await service.sendNotification('user-1', 'contract_signed', 'Title', 'Message');

    const count = await service.getUnreadCount('user-1');

    expect(count).toBe(2);
  });

  it('should render notification template', async () => {
    const rendered = await service.renderTemplate('contract_created', {
      contractTitle: 'Test Contract',
      createdBy: 'John'
    });

    expect(rendered.subject).toContain('Test Contract');
    expect(rendered.body).toContain('John');
  });
});
