import ContractManagementSystem from '../../ContractManagementSystem';

describe('Contract Management System - Integration Tests', () => {
  let cms: ContractManagementSystem;
  const tenantId = 'tenant-123';
  const userId = 'user-123';

  beforeEach(() => {
    cms = new ContractManagementSystem();
  });

  describe('End-to-End Contract Lifecycle', () => {
    it('should complete full contract lifecycle', async () => {
      // 1. Create contract
      const contract = await cms.createContract(tenantId, {
        title: 'Service Agreement',
        description: 'Professional services',
        parties: [
          { id: 'party-1', name: 'Client', email: 'client@test.com', role: 'buyer' },
          { id: 'party-2', name: 'Provider', email: 'provider@test.com', role: 'seller' }
        ],
        terms: { startDate: new Date(), endDate: new Date(), value: 50000 }
      }, userId);

      expect(contract.status).toBe('draft');

      // 2. Sign contract
      const signed = await cms.signContract(
        contract.id,
        tenantId,
        'party-1',
        'signature-data',
        userId
      );

      expect(signed.status).toBe('signed');

      // 3. Execute contract
      const executed = await cms.executeContract(contract.id, tenantId, userId);

      expect(executed.status).toBe('executed');

      // 4. Add milestone
      const milestone = await cms.addMilestone(contract.id, {
        name: 'Phase 1 Complete',
        dueDate: new Date()
      });

      expect(milestone).toBeDefined();

      // 5. Complete contract
      const completed = await cms.completeContract(contract.id, tenantId, userId);

      expect(completed.status).toBe('completed');
    });

    it('should handle contract negotiation', async () => {
      // 1. Create contract
      const contract = await cms.createContract(tenantId, {
        title: 'Test Contract',
        parties: [
          { id: 'party-1', name: 'Party 1', email: 'p1@test.com', role: 'buyer' }
        ]
      }, userId);

      // 2. Start negotiation
      const session = await cms.startNegotiation(contract.id, ['user-1', 'user-2']);

      expect(session.status).toBe('active');

      // 3. Propose changes
      const change = await cms.proposeChange(
        contract.id,
        session.id,
        {
          changeType: 'modification',
          section: 'Terms',
          originalContent: 'Old terms',
          proposedContent: 'New terms',
          reason: 'Better for both parties'
        },
        'user-1'
      );

      expect(change.status).toBe('proposed');
    });

    it('should handle contract renewal', async () => {
      // 1. Create and execute contract
      const contract = await cms.createContract(tenantId, {
        title: 'Renewable Contract',
        parties: [{ id: 'party-1', name: 'Party', email: 'p@test.com', role: 'buyer' }],
        terms: { startDate: new Date(), endDate: new Date(), value: 10000 }
      }, userId);

      // 2. Create renewal request
      const renewalRequest = await cms.createRenewalRequest(
        contract.id,
        userId,
        { term: '2 years', value: 12000 }
      );

      expect(renewalRequest.status).toBe('pending');
    });
  });

  describe('Template-Based Contract Generation', () => {
    it('should generate contract from template', async () => {
      // 1. Create template
      const template = await cms.createTemplate(tenantId, {
        name: 'Service Agreement Template',
        content: 'Agreement between {{CLIENT}} and {{PROVIDER}} for {{SERVICE}}',
        variables: [
          { name: 'CLIENT', type: 'text', required: true },
          { name: 'PROVIDER', type: 'text', required: true },
          { name: 'SERVICE', type: 'text', required: true }
        ]
      }, userId);

      expect(template).toBeDefined();

      // 2. Generate from template
      const content = await cms.generateFromTemplate(template.id, tenantId, {
        CLIENT: 'Acme Corp',
        PROVIDER: 'Tech Solutions',
        SERVICE: 'Software Development'
      });

      expect(content).toContain('Acme Corp');
      expect(content).toContain('Tech Solutions');
      expect(content).toContain('Software Development');
    });
  });

  describe('Compliance and Monitoring', () => {
    it('should check compliance and monitor contract', async () => {
      // 1. Create contract
      const contract = await cms.createContract(tenantId, {
        title: 'Compliant Contract',
        parties: [
          { id: 'party-1', name: 'Party', email: 'p@test.com', role: 'buyer', verified: true }
        ]
      }, userId);

      // 2. Check compliance
      const violations = await cms.checkContractCompliance(contract.id, contract);

      expect(Array.isArray(violations)).toBe(true);

      // 3. Get compliance report
      const report = await cms.getComplianceReport(contract.id);

      expect(report).toBeDefined();
      expect(report.contractId).toBe(contract.id);

      // 4. Get monitoring summary
      const summary = await cms.getMonitoringSummary(contract.id);

      expect(summary).toBeDefined();
    });
  });

  describe('Analytics and Reporting', () => {
    it('should generate analytics and reports', async () => {
      // 1. Create multiple contracts
      for (let i = 0; i < 3; i++) {
        await cms.createContract(tenantId, {
          title: `Contract ${i}`,
          parties: []
        }, userId);
      }

      // 2. Get analytics
      const analytics = await cms.getContractAnalytics();

      expect(analytics.totalContracts).toBe(3);
      expect(analytics.draftContracts).toBe(3);

      // 3. Generate performance report
      const report = await cms.generatePerformanceReport(
        new Date(Date.now() - 86400000),
        new Date()
      );

      expect(report).toBeDefined();
      expect(report.metrics).toBeDefined();
    });
  });

  describe('Notifications', () => {
    it('should send and manage notifications', async () => {
      // 1. Send notification
      const notification = await cms.sendNotification(
        'user-1',
        'contract_created',
        'New Contract Created',
        'A new contract has been created for your review'
      );

      expect(notification).toBeDefined();
      expect(notification.read).toBe(false);

      // 2. Get user notifications
      const result = await cms.getUserNotifications('user-1');

      expect(result.notifications.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Party Contracts', () => {
    it('should handle contracts with multiple parties', async () => {
      const contract = await cms.createContract(tenantId, {
        title: 'Multi-Party Agreement',
        parties: [
          { id: 'party-1', name: 'Party 1', email: 'p1@test.com', role: 'buyer' },
          { id: 'party-2', name: 'Party 2', email: 'p2@test.com', role: 'seller' },
          { id: 'party-3', name: 'Party 3', email: 'p3@test.com', role: 'witness' }
        ]
      }, userId);

      expect(contract.parties.length).toBe(3);

      // Sign by multiple parties
      const sig1 = await cms.signContract(contract.id, tenantId, 'party-1', 'sig1', userId);
      expect(sig1.signatures.length).toBe(1);

      const sig2 = await cms.signContract(contract.id, tenantId, 'party-2', 'sig2', userId);
      expect(sig2.signatures.length).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid operations gracefully', async () => {
      // Try to execute non-existent contract
      await expect(
        cms.executeContract('non-existent', tenantId, userId)
      ).rejects.toThrow();

      // Try to sign non-existent contract
      await expect(
        cms.signContract('non-existent', tenantId, 'party-1', 'sig', userId)
      ).rejects.toThrow();
    });
  });

  describe('System Status and Metrics', () => {
    it('should report system status and metrics', async () => {
      const status = await cms.getSystemStatus();

      expect(status.status).toBe('operational');
      expect(status.components).toBeDefined();
      expect(status.uptime).toBeGreaterThan(0);

      const metrics = await cms.getSystemMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.successRate).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent contract creation', async () => {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          cms.createContract(tenantId, {
            title: `Concurrent Contract ${i}`,
            parties: []
          }, userId)
        );
      }

      const contracts = await Promise.all(promises);

      expect(contracts.length).toBe(5);
      expect(contracts.every(c => c.id)).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // 1. Create contract
      const contract = await cms.createContract(tenantId, {
        title: 'Consistency Test',
        parties: [{ id: 'party-1', name: 'Party', email: 'p@test.com', role: 'buyer' }]
      }, userId);

      // 2. Retrieve and verify
      const retrieved = await cms.getContract(contract.id, tenantId);

      expect(retrieved?.id).toBe(contract.id);
      expect(retrieved?.title).toBe('Consistency Test');

      // 3. Update and verify
      const updated = await cms.updateContract(
        contract.id,
        tenantId,
        { title: 'Updated Title' },
        userId
      );

      expect(updated.title).toBe('Updated Title');

      // 4. Retrieve again and verify
      const final = await cms.getContract(contract.id, tenantId);

      expect(final?.title).toBe('Updated Title');
    });
  });

  describe('Event Emission', () => {
    it('should emit events for all major operations', async () => {
      const events: string[] = [];

      cms.on('contract:created', () => events.push('created'));
      cms.on('contract:signed', () => events.push('signed'));
      cms.on('contract:executed', () => events.push('executed'));
      cms.on('contract:completed', () => events.push('completed'));

      const contract = await cms.createContract(tenantId, {
        title: 'Event Test',
        parties: [{ id: 'party-1', name: 'Party', email: 'p@test.com', role: 'buyer' }]
      }, userId);

      await cms.signContract(contract.id, tenantId, 'party-1', 'sig', userId);
      await cms.executeContract(contract.id, tenantId, userId);
      await cms.completeContract(contract.id, tenantId, userId);

      expect(events.length).toBe(4);
      expect(events).toContain('created');
      expect(events).toContain('signed');
      expect(events).toContain('executed');
      expect(events).toContain('completed');
    });
  });
});
