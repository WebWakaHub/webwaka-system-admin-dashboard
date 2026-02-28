import { ContractManager, Contract, Party, ContractTerms } from '../../components/ContractManager';

describe('ContractManager', () => {
  let contractManager: ContractManager;
  const tenantId = 'tenant-123';
  const userId = 'user-123';

  beforeEach(() => {
    contractManager = new ContractManager();
  });

  describe('createContract', () => {
    it('should create a contract with valid data', async () => {
      const data: Partial<Contract> = {
        title: 'Test Contract',
        description: 'Test Description',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }],
        terms: { startDate: new Date(), endDate: new Date(), value: 10000 }
      };

      const contract = await contractManager.createContract(tenantId, data, userId);

      expect(contract).toBeDefined();
      expect(contract.id).toBeDefined();
      expect(contract.title).toBe('Test Contract');
      expect(contract.status).toBe('draft');
      expect(contract.tenantId).toBe(tenantId);
      expect(contract.createdBy).toBe(userId);
    });

    it('should emit contract:created event', async () => {
      const spy = jest.fn();
      contractManager.on('contract:created', spy);

      const data: Partial<Contract> = {
        title: 'Test Contract',
        parties: [],
        terms: {}
      };

      await contractManager.createContract(tenantId, data, userId);

      expect(spy).toHaveBeenCalled();
    });

    it('should initialize contract with default values', async () => {
      const data: Partial<Contract> = {};

      const contract = await contractManager.createContract(tenantId, data, userId);

      expect(contract.title).toBe('');
      expect(contract.description).toBe('');
      expect(contract.parties).toEqual([]);
      expect(contract.terms).toEqual({});
      expect(contract.status).toBe('draft');
      expect(contract.version).toBe(1);
    });
  });

  describe('getContract', () => {
    it('should retrieve a contract by ID', async () => {
      const data: Partial<Contract> = { title: 'Test Contract' };
      const created = await contractManager.createContract(tenantId, data, userId);

      const retrieved = await contractManager.getContract(created.id, tenantId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Test Contract');
    });

    it('should return null for non-existent contract', async () => {
      const retrieved = await contractManager.getContract('non-existent', tenantId);

      expect(retrieved).toBeNull();
    });

    it('should return null for contract from different tenant', async () => {
      const data: Partial<Contract> = { title: 'Test Contract' };
      const created = await contractManager.createContract(tenantId, data, userId);

      const retrieved = await contractManager.getContract(created.id, 'different-tenant');

      expect(retrieved).toBeNull();
    });
  });

  describe('updateContract', () => {
    it('should update contract with new data', async () => {
      const data: Partial<Contract> = { title: 'Original Title' };
      const created = await contractManager.createContract(tenantId, data, userId);

      const updated = await contractManager.updateContract(
        created.id,
        tenantId,
        { title: 'Updated Title' },
        userId
      );

      expect(updated.title).toBe('Updated Title');
      expect(updated.version).toBe(2);
    });

    it('should throw error for non-existent contract', async () => {
      await expect(
        contractManager.updateContract('non-existent', tenantId, {}, userId)
      ).rejects.toThrow('Contract not found');
    });

    it('should emit contract:updated event', async () => {
      const spy = jest.fn();
      contractManager.on('contract:updated', spy);

      const data: Partial<Contract> = { title: 'Test' };
      const created = await contractManager.createContract(tenantId, data, userId);

      await contractManager.updateContract(created.id, tenantId, { title: 'Updated' }, userId);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('listContracts', () => {
    it('should list all contracts for tenant', async () => {
      await contractManager.createContract(tenantId, { title: 'Contract 1' }, userId);
      await contractManager.createContract(tenantId, { title: 'Contract 2' }, userId);

      const result = await contractManager.listContracts(tenantId);

      expect(result.contracts.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should filter contracts by status', async () => {
      const c1 = await contractManager.createContract(tenantId, { title: 'Contract 1' }, userId);
      await contractManager.createContract(tenantId, { title: 'Contract 2' }, userId);

      await contractManager.signContract(c1.id, tenantId, 'party-1', 'sig', userId);

      const result = await contractManager.listContracts(tenantId, { status: 'signed' });

      expect(result.contracts.length).toBe(1);
    });

    it('should apply pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await contractManager.createContract(tenantId, { title: `Contract ${i}` }, userId);
      }

      const result = await contractManager.listContracts(tenantId, { limit: 2, offset: 0 });

      expect(result.contracts.length).toBe(2);
      expect(result.total).toBe(5);
    });
  });

  describe('signContract', () => {
    it('should sign contract with valid signature', async () => {
      const data: Partial<Contract> = {
        title: 'Test Contract',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }]
      };
      const created = await contractManager.createContract(tenantId, data, userId);

      const signed = await contractManager.signContract(created.id, tenantId, 'party-1', 'signature', userId);

      expect(signed.status).toBe('signed');
      expect(signed.signatures.length).toBe(1);
      expect(signed.signatures[0].partyId).toBe('party-1');
    });

    it('should throw error for non-existent contract', async () => {
      await expect(
        contractManager.signContract('non-existent', tenantId, 'party-1', 'sig', userId)
      ).rejects.toThrow('Contract not found');
    });

    it('should emit contract:signed event', async () => {
      const spy = jest.fn();
      contractManager.on('contract:signed', spy);

      const data: Partial<Contract> = {
        title: 'Test',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }]
      };
      const created = await contractManager.createContract(tenantId, data, userId);

      await contractManager.signContract(created.id, tenantId, 'party-1', 'sig', userId);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('executeContract', () => {
    it('should execute signed contract', async () => {
      const data: Partial<Contract> = {
        title: 'Test',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }]
      };
      const created = await contractManager.createContract(tenantId, data, userId);
      await contractManager.signContract(created.id, tenantId, 'party-1', 'sig', userId);

      const executed = await contractManager.executeContract(created.id, tenantId, userId);

      expect(executed.status).toBe('executed');
    });

    it('should throw error if contract not signed', async () => {
      const data: Partial<Contract> = { title: 'Test', parties: [] };
      const created = await contractManager.createContract(tenantId, data, userId);

      await expect(
        contractManager.executeContract(created.id, tenantId, userId)
      ).rejects.toThrow('Contract must be signed before execution');
    });

    it('should emit contract:executed event', async () => {
      const spy = jest.fn();
      contractManager.on('contract:executed', spy);

      const data: Partial<Contract> = {
        title: 'Test',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }]
      };
      const created = await contractManager.createContract(tenantId, data, userId);
      await contractManager.signContract(created.id, tenantId, 'party-1', 'sig', userId);

      await contractManager.executeContract(created.id, tenantId, userId);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('completeContract', () => {
    it('should complete executed contract', async () => {
      const data: Partial<Contract> = {
        title: 'Test',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }]
      };
      const created = await contractManager.createContract(tenantId, data, userId);
      await contractManager.signContract(created.id, tenantId, 'party-1', 'sig', userId);
      await contractManager.executeContract(created.id, tenantId, userId);

      const completed = await contractManager.completeContract(created.id, tenantId, userId);

      expect(completed.status).toBe('completed');
    });

    it('should emit contract:completed event', async () => {
      const spy = jest.fn();
      contractManager.on('contract:completed', spy);

      const data: Partial<Contract> = {
        title: 'Test',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }]
      };
      const created = await contractManager.createContract(tenantId, data, userId);
      await contractManager.signContract(created.id, tenantId, 'party-1', 'sig', userId);
      await contractManager.executeContract(created.id, tenantId, userId);

      await contractManager.completeContract(created.id, tenantId, userId);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getContractHistory', () => {
    it('should return contract history', async () => {
      const data: Partial<Contract> = { title: 'Original' };
      const created = await contractManager.createContract(tenantId, data, userId);

      await contractManager.updateContract(created.id, tenantId, { title: 'Updated' }, userId);

      const history = await contractManager.getContractHistory(created.id);

      expect(history.length).toBeGreaterThan(1);
      expect(history[0].version).toBe(1);
      expect(history[1].version).toBe(2);
    });
  });

  describe('searchContracts', () => {
    it('should search contracts by title', async () => {
      await contractManager.createContract(tenantId, { title: 'Important Contract' }, userId);
      await contractManager.createContract(tenantId, { title: 'Regular Contract' }, userId);

      const results = await contractManager.searchContracts(tenantId, 'Important');

      expect(results.length).toBe(1);
      expect(results[0].title).toContain('Important');
    });

    it('should search contracts by description', async () => {
      await contractManager.createContract(
        tenantId,
        { title: 'Contract', description: 'Urgent matter' },
        userId
      );

      const results = await contractManager.searchContracts(tenantId, 'Urgent');

      expect(results.length).toBe(1);
    });
  });

  describe('expireContract', () => {
    it('should expire contract', async () => {
      const data: Partial<Contract> = { title: 'Test' };
      const created = await contractManager.createContract(tenantId, data, userId);

      const expired = await contractManager.expireContract(created.id, tenantId);

      expect(expired.status).toBe('expired');
    });

    it('should emit contract:expired event', async () => {
      const spy = jest.fn();
      contractManager.on('contract:expired', spy);

      const data: Partial<Contract> = { title: 'Test' };
      const created = await contractManager.createContract(tenantId, data, userId);

      await contractManager.expireContract(created.id, tenantId);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getContractsByParty', () => {
    it('should retrieve contracts by party', async () => {
      const data: Partial<Contract> = {
        title: 'Test',
        parties: [{ id: 'party-1', name: 'Party 1', email: 'party1@test.com', role: 'buyer' }]
      };
      await contractManager.createContract(tenantId, data, userId);

      const contracts = await contractManager.getContractsByParty(tenantId, 'party-1');

      expect(contracts.length).toBe(1);
      expect(contracts[0].parties[0].id).toBe('party-1');
    });
  });

  describe('getContractStats', () => {
    it('should return contract statistics', async () => {
      await contractManager.createContract(tenantId, { title: 'Contract 1' }, userId);
      await contractManager.createContract(tenantId, { title: 'Contract 2' }, userId);

      const stats = await contractManager.getContractStats(tenantId);

      expect(stats.totalContracts).toBe(2);
      expect(stats.draftContracts).toBe(2);
      expect(stats.signedContracts).toBe(0);
    });
  });

  describe('bulk operations', () => {
    it('should bulk create contracts', async () => {
      const contracts = [
        { title: 'Contract 1' },
        { title: 'Contract 2' },
        { title: 'Contract 3' }
      ];

      const created = await contractManager.bulkCreateContracts(tenantId, contracts, userId);

      expect(created.length).toBe(3);
      expect(created[0].title).toBe('Contract 1');
    });

    it('should bulk update contracts', async () => {
      const c1 = await contractManager.createContract(tenantId, { title: 'C1' }, userId);
      const c2 = await contractManager.createContract(tenantId, { title: 'C2' }, userId);

      const updates = [
        { id: c1.id, title: 'Updated C1' },
        { id: c2.id, title: 'Updated C2' }
      ];

      const updated = await contractManager.bulkUpdateContracts(tenantId, updates, userId);

      expect(updated.length).toBe(2);
      expect(updated[0].title).toBe('Updated C1');
    });
  });
});
