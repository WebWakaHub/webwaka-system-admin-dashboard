/**
 * Key Management
 * Manages API keys for BYOK (Bring Your Own Key) support
 * Handles encryption, storage, rotation, and access control
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface BYOKKey {
  id: string;
  name: string;
  provider: string;
  encryptedKey: string;
  salt: string;
  iv: string;
  keyHash: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface KeyRotationPolicy {
  enabled: boolean;
  rotationIntervalDays: number;
  notificationDays: number;
}

export class KeyManagement extends EventEmitter {
  private keys: Map<string, BYOKKey> = new Map();
  private encryptionKey: string;
  private rotationPolicies: Map<string, KeyRotationPolicy> = new Map();
  private auditLog: Array<{
    timestamp: Date;
    action: string;
    keyId: string;
    details: Record<string, any>;
  }> = [];

  constructor(encryptionKey?: string) {
    super();
    this.encryptionKey = encryptionKey || this.generateEncryptionKey();
    this.initializeDefaultPolicies();
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Initialize default rotation policies
   */
  private initializeDefaultPolicies(): void {
    this.rotationPolicies.set('default', {
      enabled: true,
      rotationIntervalDays: 90,
      notificationDays: 7,
    });

    this.emit('policies:initialized', { count: this.rotationPolicies.size });
  }

  /**
   * Create a new BYOK key
   */
  public createKey(
    name: string,
    provider: string,
    apiKey: string,
    expiresAt?: Date,
    metadata?: Record<string, any>
  ): BYOKKey {
    // Validate input
    if (!name || !provider || !apiKey) {
      throw new Error('Name, provider, and API key are required');
    }

    // Generate salt and IV
    const salt = crypto.randomBytes(16).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');

    // Encrypt the API key
    const encryptedKey = this.encryptKey(apiKey, salt, iv);

    // Generate key hash for verification
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Create key object
    const key: BYOKKey = {
      id: uuidv4(),
      name,
      provider,
      encryptedKey,
      salt,
      iv,
      keyHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
      isActive: true,
      metadata,
    };

    // Store key
    this.keys.set(key.id, key);

    // Log action
    this.logAction('key:created', key.id, { provider, name });

    // Emit event
    this.emit('key:created', { keyId: key.id, provider });

    return key;
  }

  /**
   * Encrypt API key
   */
  private encryptKey(apiKey: string, salt: string, iv: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(iv, 'hex')
    );

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  /**
   * Decrypt API key
   */
  private decryptKey(encryptedKey: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(iv, 'hex')
    );

    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Get decrypted API key
   */
  public getDecryptedKey(keyId: string): string | null {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`Key not found: ${keyId}`);
    }

    if (!key.isActive) {
      throw new Error(`Key is not active: ${keyId}`);
    }

    if (key.expiresAt && new Date() > key.expiresAt) {
      throw new Error(`Key has expired: ${keyId}`);
    }

    // Log access
    this.logAction('key:accessed', keyId, { provider: key.provider });

    return this.decryptKey(key.encryptedKey, key.iv);
  }

  /**
   * Rotate a key
   */
  public rotateKey(keyId: string, newApiKey: string): BYOKKey {
    const oldKey = this.keys.get(keyId);
    if (!oldKey) {
      throw new Error(`Key not found: ${keyId}`);
    }

    // Create new key with same properties
    const newKey = this.createKey(
      oldKey.name,
      oldKey.provider,
      newApiKey,
      oldKey.expiresAt,
      oldKey.metadata
    );

    // Deactivate old key
    oldKey.isActive = false;
    oldKey.updatedAt = new Date();

    // Log action
    this.logAction('key:rotated', keyId, { newKeyId: newKey.id });

    // Emit event
    this.emit('key:rotated', { oldKeyId: keyId, newKeyId: newKey.id });

    return newKey;
  }

  /**
   * Revoke a key
   */
  public revokeKey(keyId: string): void {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`Key not found: ${keyId}`);
    }

    key.isActive = false;
    key.updatedAt = new Date();

    // Log action
    this.logAction('key:revoked', keyId, { provider: key.provider });

    // Emit event
    this.emit('key:revoked', { keyId });
  }

  /**
   * Get key by ID
   */
  public getKey(keyId: string): BYOKKey | undefined {
    return this.keys.get(keyId);
  }

  /**
   * List all keys for a provider
   */
  public listKeysByProvider(provider: string): BYOKKey[] {
    const keys: BYOKKey[] = [];
    this.keys.forEach((key) => {
      if (key.provider === provider) {
        keys.push(key);
      }
    });
    return keys;
  }

  /**
   * List all active keys
   */
  public listActiveKeys(): BYOKKey[] {
    const keys: BYOKKey[] = [];
    this.keys.forEach((key) => {
      if (key.isActive && (!key.expiresAt || new Date() <= key.expiresAt)) {
        keys.push(key);
      }
    });
    return keys;
  }

  /**
   * Log action for audit trail
   */
  private logAction(action: string, keyId: string, details: Record<string, any>): void {
    this.auditLog.push({
      timestamp: new Date(),
      action,
      keyId,
      details,
    });

    this.emit('audit:logged', { action, keyId });
  }

  /**
   * Get audit log
   */
  public getAuditLog(keyId?: string): Array<{
    timestamp: Date;
    action: string;
    keyId: string;
    details: Record<string, any>;
  }> {
    if (keyId) {
      return this.auditLog.filter((entry) => entry.keyId === keyId);
    }
    return this.auditLog;
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    revokedKeys: number;
  } {
    let activeKeys = 0;
    let expiredKeys = 0;
    let revokedKeys = 0;

    this.keys.forEach((key) => {
      if (!key.isActive) {
        revokedKeys++;
      } else if (key.expiresAt && new Date() > key.expiresAt) {
        expiredKeys++;
      } else {
        activeKeys++;
      }
    });

    return {
      totalKeys: this.keys.size,
      activeKeys,
      expiredKeys,
      revokedKeys,
    };
  }

  /**
   * Validate key format
   */
  public validateKeyFormat(apiKey: string, provider: string): boolean {
    // Basic validation - can be extended per provider
    if (!apiKey || apiKey.length < 10) {
      return false;
    }

    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
      return false;
    }

    if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
      return false;
    }

    return true;
  }
}

export default KeyManagement;
