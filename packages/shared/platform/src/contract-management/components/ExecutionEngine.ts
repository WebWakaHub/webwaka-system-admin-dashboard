import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface DigitalSignature {
  id: string;
  contractId: string;
  partyId: string;
  signatureData: string;
  signatureHash: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface ExecutionRecord {
  id: string;
  contractId: string;
  executionDate: Date;
  executedBy: string;
  signatures: DigitalSignature[];
  status: 'pending' | 'completed' | 'failed';
  details: Record<string, any>;
}

export class ExecutionEngine extends EventEmitter {
  private signatures: Map<string, DigitalSignature> = new Map();
  private executionRecords: Map<string, ExecutionRecord> = new Map();
  private contractExecutions: Map<string, ExecutionRecord[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Create digital signature
   */
  async createSignature(
    contractId: string,
    partyId: string,
    signatureData: string,
    ipAddress: string,
    userAgent: string
  ): Promise<DigitalSignature> {
    const signature: DigitalSignature = {
      id: uuidv4(),
      contractId,
      partyId,
      signatureData,
      signatureHash: this.hashSignature(signatureData),
      timestamp: new Date(),
      ipAddress,
      userAgent
    };

    this.signatures.set(signature.id, signature);
    this.emit('signature:created', signature);

    return signature;
  }

  /**
   * Verify signature
   */
  async verifySignature(
    signatureId: string,
    contractId: string
  ): Promise<boolean> {
    const signature = this.signatures.get(signatureId);
    if (!signature || signature.contractId !== contractId) {
      return false;
    }

    // Verify signature hash
    const expectedHash = this.hashSignature(signature.signatureData);
    return signature.signatureHash === expectedHash;
  }

  /**
   * Create execution record
   */
  async createExecutionRecord(
    contractId: string,
    executedBy: string,
    signatures: DigitalSignature[]
  ): Promise<ExecutionRecord> {
    const record: ExecutionRecord = {
      id: uuidv4(),
      contractId,
      executionDate: new Date(),
      executedBy,
      signatures,
      status: 'completed',
      details: {
        signatureCount: signatures.length,
        verificationStatus: 'verified'
      }
    };

    this.executionRecords.set(record.id, record);
    const records = this.contractExecutions.get(contractId) || [];
    records.push(record);
    this.contractExecutions.set(contractId, records);

    this.emit('execution:recorded', record);

    return record;
  }

  /**
   * Get execution record
   */
  async getExecutionRecord(recordId: string): Promise<ExecutionRecord | null> {
    return this.executionRecords.get(recordId) || null;
  }

  /**
   * Get contract executions
   */
  async getContractExecutions(contractId: string): Promise<ExecutionRecord[]> {
    return this.contractExecutions.get(contractId) || [];
  }

  /**
   * Get signature
   */
  async getSignature(signatureId: string): Promise<DigitalSignature | null> {
    return this.signatures.get(signatureId) || null;
  }

  /**
   * Get contract signatures
   */
  async getContractSignatures(contractId: string): Promise<DigitalSignature[]> {
    return Array.from(this.signatures.values()).filter(
      s => s.contractId === contractId
    );
  }

  /**
   * Hash signature for verification
   */
  private hashSignature(signatureData: string): string {
    return crypto
      .createHash('sha256')
      .update(signatureData)
      .digest('hex');
  }

  /**
   * Generate signature certificate
   */
  async generateCertificate(
    signatureId: string
  ): Promise<string> {
    const signature = this.signatures.get(signatureId);
    if (!signature) {
      throw new Error('Signature not found');
    }

    const certificate = {
      signatureId: signature.id,
      contractId: signature.contractId,
      partyId: signature.partyId,
      timestamp: signature.timestamp,
      hash: signature.signatureHash,
      verified: true
    };

    return JSON.stringify(certificate);
  }

  /**
   * Revoke signature
   */
  async revokeSignature(signatureId: string): Promise<void> {
    const signature = this.signatures.get(signatureId);
    if (!signature) {
      throw new Error('Signature not found');
    }

    this.signatures.delete(signatureId);
    this.emit('signature:revoked', signature);
  }

  /**
   * Bulk sign contract
   */
  async bulkSign(
    contractId: string,
    signatures: Array<{
      partyId: string;
      signatureData: string;
      ipAddress: string;
      userAgent: string;
    }>,
    executedBy: string
  ): Promise<ExecutionRecord> {
    const createdSignatures: DigitalSignature[] = [];

    for (const sig of signatures) {
      const signature = await this.createSignature(
        contractId,
        sig.partyId,
        sig.signatureData,
        sig.ipAddress,
        sig.userAgent
      );
      createdSignatures.push(signature);
    }

    return this.createExecutionRecord(contractId, executedBy, createdSignatures);
  }
}
