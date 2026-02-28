import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface Contract {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  templateId?: string;
  status: 'draft' | 'negotiation' | 'signed' | 'executed' | 'completed' | 'expired';
  parties: Party[];
  terms: ContractTerms;
  content: string;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  expiresAt?: Date;
  metadata: Record<string, any>;
}

export interface Party {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'service_provider' | 'client' | 'witness' | 'mediator';
  signatureStatus: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
  permissions: string[];
}

export interface ContractTerms {
  startDate: Date;
  endDate: Date;
  value: number;
  currency: string;
  paymentTerms: string;
  deliverables: string[];
  penalties: Penalty[];
  renewalTerms?: RenewalTerms;
}

export interface Penalty {
  name: string;
  description: string;
  amount: number;
  trigger: string;
}

export interface RenewalTerms {
  autoRenew: boolean;
  renewalPeriod: number;
  renewalNotice: number;
}

export class ContractManager extends EventEmitter {
  private contracts: Map<string, Contract> = new Map();
  private contractVersions: Map<string, Contract[]> = new Map();
  private contractAuditLog: Map<string, AuditLog[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Create a new contract
   */
  async createContract(
    tenantId: string,
    data: Partial<Contract>,
    userId: string
  ): Promise<Contract> {
    const contract: Contract = {
      id: uuidv4(),
      tenantId,
      title: data.title || '',
      description: data.description || '',
      templateId: data.templateId,
      status: 'draft',
      parties: data.parties || [],
      terms: data.terms || {
        startDate: new Date(),
        endDate: new Date(),
        value: 0,
        currency: 'NGN',
        paymentTerms: '',
        deliverables: [],
        penalties: []
      },
      content: data.content || '',
      version: 1,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: data.metadata || {}
    };

    this.contracts.set(contract.id, contract);
    this.contractVersions.set(contract.id, [contract]);
    this.logAudit(contract.id, 'created', userId, { contract });
    this.emit('contract:created', contract);

    return contract;
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId: string, tenantId: string): Promise<Contract | null> {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.tenantId !== tenantId) {
      return null;
    }
    return contract;
  }

  /**
   * Update contract
   */
  async updateContract(
    contractId: string,
    tenantId: string,
    updates: Partial<Contract>,
    userId: string
  ): Promise<Contract> {
    const contract = await this.getContract(contractId, tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Create new version
    const updatedContract: Contract = {
      ...contract,
      ...updates,
      version: contract.version + 1,
      updatedAt: new Date()
    };

    this.contracts.set(contractId, updatedContract);
    const versions = this.contractVersions.get(contractId) || [];
    versions.push(updatedContract);
    this.contractVersions.set(contractId, versions);

    this.logAudit(contractId, 'updated', userId, { updates });
    this.emit('contract:updated', updatedContract);

    return updatedContract;
  }

  /**
   * List contracts
   */
  async listContracts(
    tenantId: string,
    filters?: {
      status?: string;
      partyId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ contracts: Contract[]; total: number }> {
    let contracts = Array.from(this.contracts.values()).filter(
      c => c.tenantId === tenantId
    );

    if (filters?.status) {
      contracts = contracts.filter(c => c.status === filters.status);
    }

    if (filters?.partyId) {
      contracts = contracts.filter(c =>
        c.parties.some(p => p.id === filters.partyId)
      );
    }

    const total = contracts.length;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      contracts: contracts.slice(offset, offset + limit),
      total
    };
  }

  /**
   * Sign contract
   */
  async signContract(
    contractId: string,
    tenantId: string,
    partyId: string,
    signature: string,
    userId: string
  ): Promise<Contract> {
    const contract = await this.getContract(contractId, tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const party = contract.parties.find(p => p.id === partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    party.signatureStatus = 'signed';
    party.signedAt = new Date();

    // Check if all parties have signed
    const allSigned = contract.parties.every(p => p.signatureStatus === 'signed');
    if (allSigned) {
      contract.status = 'signed';
      contract.signedAt = new Date();
    }

    this.contracts.set(contractId, contract);
    this.logAudit(contractId, 'signed', userId, { partyId, signature });
    this.emit('contract:signed', { contract, partyId });

    return contract;
  }

  /**
   * Execute contract
   */
  async executeContract(
    contractId: string,
    tenantId: string,
    userId: string
  ): Promise<Contract> {
    const contract = await this.getContract(contractId, tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'signed') {
      throw new Error('Contract must be signed before execution');
    }

    contract.status = 'executed';
    this.contracts.set(contractId, contract);
    this.logAudit(contractId, 'executed', userId, {});
    this.emit('contract:executed', contract);

    return contract;
  }

  /**
   * Complete contract
   */
  async completeContract(
    contractId: string,
    tenantId: string,
    userId: string
  ): Promise<Contract> {
    const contract = await this.getContract(contractId, tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    contract.status = 'completed';
    this.contracts.set(contractId, contract);
    this.logAudit(contractId, 'completed', userId, {});
    this.emit('contract:completed', contract);

    return contract;
  }

  /**
   * Expire contract
   */
  async expireContract(
    contractId: string,
    tenantId: string,
    userId: string
  ): Promise<Contract> {
    const contract = await this.getContract(contractId, tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    contract.status = 'expired';
    this.contracts.set(contractId, contract);
    this.logAudit(contractId, 'expired', userId, {});
    this.emit('contract:expired', contract);

    return contract;
  }

  /**
   * Get contract version history
   */
  async getContractVersions(contractId: string): Promise<Contract[]> {
    return this.contractVersions.get(contractId) || [];
  }

  /**
   * Get audit log
   */
  async getAuditLog(contractId: string): Promise<AuditLog[]> {
    return this.contractAuditLog.get(contractId) || [];
  }

  /**
   * Log audit entry
   */
  private logAudit(
    contractId: string,
    action: string,
    actor: string,
    details: any
  ): void {
    const log: AuditLog = {
      id: uuidv4(),
      contractId,
      action,
      actor,
      timestamp: new Date(),
      details,
      ipAddress: '0.0.0.0',
      userAgent: ''
    };

    const logs = this.contractAuditLog.get(contractId) || [];
    logs.push(log);
    this.contractAuditLog.set(contractId, logs);
  }

  /**
   * Search contracts
   */
  async searchContracts(
    tenantId: string,
    query: string
  ): Promise<Contract[]> {
    const contracts = Array.from(this.contracts.values()).filter(
      c => c.tenantId === tenantId &&
        (c.title.toLowerCase().includes(query.toLowerCase()) ||
         c.description.toLowerCase().includes(query.toLowerCase()))
    );
    return contracts;
  }
}

export interface AuditLog {
  id: string;
  contractId: string;
  action: string;
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}
