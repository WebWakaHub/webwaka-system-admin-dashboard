/**
 * Unit Tests for KeyManagement
 * Tests for BYOK support, encryption, key rotation, and audit logging
 */

import KeyManagement from '../../components/KeyManagement';

describe('KeyManagement', () => {
  let keyManagement: KeyManagement;

  beforeEach(() => {
    keyManagement = new KeyManagement();
  });

  describe('createKey', () => {
    it('should create a new key', () => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');

      expect(key).toBeDefined();
      expect(key.id).toBeDefined();
      expect(key.name).toBe('test-key');
      expect(key.provider).toBe('openai');
      expect(key.isActive).toBe(true);
    });

    it('should throw error when name is missing', () => {
      expect(() => {
        keyManagement.createKey('', 'openai', 'sk-test-api-key');
      }).toThrow('Name, provider, and API key are required');
    });

    it('should throw error when provider is missing', () => {
      expect(() => {
        keyManagement.createKey('test-key', '', 'sk-test-api-key');
      }).toThrow('Name, provider, and API key are required');
    });

    it('should throw error when API key is missing', () => {
      expect(() => {
        keyManagement.createKey('test-key', 'openai', '');
      }).toThrow('Name, provider, and API key are required');
    });

    it('should encrypt the API key', () => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');

      expect(key.encryptedKey).not.toBe('sk-test-api-key');
      expect(key.salt).toBeDefined();
      expect(key.iv).toBeDefined();
    });

    it('should generate key hash', () => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');

      expect(key.keyHash).toBeDefined();
      expect(key.keyHash.length).toBe(64); // SHA-256 hex length
    });

    it('should emit key:created event', (done) => {
      keyManagement.on('key:created', (data) => {
        expect(data.provider).toBe('openai');
        done();
      });

      keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');
    });

    it('should support expiration date', () => {
      const expiresAt = new Date(Date.now() + 86400000); // 1 day from now
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key', expiresAt);

      expect(key.expiresAt).toEqual(expiresAt);
    });

    it('should support metadata', () => {
      const metadata = { environment: 'production', region: 'us-east-1' };
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key', undefined, metadata);

      expect(key.metadata).toEqual(metadata);
    });
  });

  describe('getDecryptedKey', () => {
    it('should decrypt and return the API key', () => {
      const originalKey = 'sk-test-api-key';
      const key = keyManagement.createKey('test-key', 'openai', originalKey);

      const decrypted = keyManagement.getDecryptedKey(key.id);

      expect(decrypted).toBe(originalKey);
    });

    it('should throw error for non-existent key', () => {
      expect(() => {
        keyManagement.getDecryptedKey('non-existent-id');
      }).toThrow('Key not found');
    });

    it('should throw error for inactive key', () => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');
      keyManagement.revokeKey(key.id);

      expect(() => {
        keyManagement.getDecryptedKey(key.id);
      }).toThrow('Key is not active');
    });

    it('should throw error for expired key', () => {
      const expiresAt = new Date(Date.now() - 1000); // 1 second ago
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key', expiresAt);

      expect(() => {
        keyManagement.getDecryptedKey(key.id);
      }).toThrow('Key has expired');
    });

    it('should emit key:accessed event', (done) => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');

      keyManagement.on('key:accessed', () => {
        done();
      });

      keyManagement.getDecryptedKey(key.id);
    });
  });

  describe('rotateKey', () => {
    it('should rotate a key', () => {
      const oldKey = keyManagement.createKey('test-key', 'openai', 'sk-old-key');
      const newKey = keyManagement.rotateKey(oldKey.id, 'sk-new-key');

      expect(newKey).toBeDefined();
      expect(newKey.id).not.toBe(oldKey.id);
      expect(keyManagement.getDecryptedKey(newKey.id)).toBe('sk-new-key');
    });

    it('should deactivate old key', () => {
      const oldKey = keyManagement.createKey('test-key', 'openai', 'sk-old-key');
      keyManagement.rotateKey(oldKey.id, 'sk-new-key');

      const retrieved = keyManagement.getKey(oldKey.id);
      expect(retrieved?.isActive).toBe(false);
    });

    it('should throw error for non-existent key', () => {
      expect(() => {
        keyManagement.rotateKey('non-existent-id', 'sk-new-key');
      }).toThrow('Key not found');
    });

    it('should emit key:rotated event', (done) => {
      const oldKey = keyManagement.createKey('test-key', 'openai', 'sk-old-key');

      keyManagement.on('key:rotated', (data) => {
        expect(data.oldKeyId).toBe(oldKey.id);
        expect(data.newKeyId).toBeDefined();
        done();
      });

      keyManagement.rotateKey(oldKey.id, 'sk-new-key');
    });
  });

  describe('revokeKey', () => {
    it('should revoke a key', () => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');
      keyManagement.revokeKey(key.id);

      const retrieved = keyManagement.getKey(key.id);
      expect(retrieved?.isActive).toBe(false);
    });

    it('should throw error for non-existent key', () => {
      expect(() => {
        keyManagement.revokeKey('non-existent-id');
      }).toThrow('Key not found');
    });

    it('should emit key:revoked event', (done) => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');

      keyManagement.on('key:revoked', (data) => {
        expect(data.keyId).toBe(key.id);
        done();
      });

      keyManagement.revokeKey(key.id);
    });
  });

  describe('getKey', () => {
    it('should retrieve a key by ID', () => {
      const created = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');
      const retrieved = keyManagement.getKey(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent key', () => {
      const retrieved = keyManagement.getKey('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('listKeysByProvider', () => {
    it('should list keys for a provider', () => {
      keyManagement.createKey('key1', 'openai', 'sk-key1');
      keyManagement.createKey('key2', 'openai', 'sk-key2');
      keyManagement.createKey('key3', 'anthropic', 'sk-key3');

      const keys = keyManagement.listKeysByProvider('openai');

      expect(keys).toHaveLength(2);
      expect(keys.every((k) => k.provider === 'openai')).toBe(true);
    });

    it('should return empty array for provider with no keys', () => {
      const keys = keyManagement.listKeysByProvider('unknown-provider');

      expect(keys).toHaveLength(0);
    });
  });

  describe('listActiveKeys', () => {
    it('should list only active keys', () => {
      const key1 = keyManagement.createKey('key1', 'openai', 'sk-key1');
      const key2 = keyManagement.createKey('key2', 'openai', 'sk-key2');

      keyManagement.revokeKey(key1.id);

      const activeKeys = keyManagement.listActiveKeys();

      expect(activeKeys).toHaveLength(1);
      expect(activeKeys[0].id).toBe(key2.id);
    });

    it('should exclude expired keys', () => {
      const expiresAt = new Date(Date.now() - 1000); // 1 second ago
      keyManagement.createKey('expired-key', 'openai', 'sk-expired', expiresAt);
      const activeKey = keyManagement.createKey('active-key', 'openai', 'sk-active');

      const activeKeys = keyManagement.listActiveKeys();

      expect(activeKeys.some((k) => k.id === activeKey.id)).toBe(true);
      expect(activeKeys.some((k) => k.name === 'expired-key')).toBe(false);
    });
  });

  describe('getAuditLog', () => {
    it('should return audit log entries', () => {
      const key = keyManagement.createKey('test-key', 'openai', 'sk-test-api-key');
      keyManagement.getDecryptedKey(key.id);

      const log = keyManagement.getAuditLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log.some((entry) => entry.action === 'key:created')).toBe(true);
    });

    it('should filter audit log by key ID', () => {
      const key1 = keyManagement.createKey('key1', 'openai', 'sk-key1');
      const key2 = keyManagement.createKey('key2', 'openai', 'sk-key2');

      keyManagement.getDecryptedKey(key1.id);

      const log = keyManagement.getAuditLog(key1.id);

      expect(log.every((entry) => entry.keyId === key1.id)).toBe(true);
    });
  });

  describe('getStatistics', () => {
    it('should return key statistics', () => {
      const key1 = keyManagement.createKey('key1', 'openai', 'sk-key1');
      const key2 = keyManagement.createKey('key2', 'openai', 'sk-key2');

      keyManagement.revokeKey(key1.id);

      const stats = keyManagement.getStatistics();

      expect(stats.totalKeys).toBe(2);
      expect(stats.activeKeys).toBe(1);
      expect(stats.revokedKeys).toBe(1);
    });

    it('should track expired keys', () => {
      const expiresAt = new Date(Date.now() - 1000); // 1 second ago
      keyManagement.createKey('expired-key', 'openai', 'sk-expired', expiresAt);

      const stats = keyManagement.getStatistics();

      expect(stats.expiredKeys).toBe(1);
    });
  });

  describe('validateKeyFormat', () => {
    it('should validate OpenAI key format', () => {
      expect(keyManagement.validateKeyFormat('sk-test-key', 'openai')).toBe(true);
      expect(keyManagement.validateKeyFormat('invalid-key', 'openai')).toBe(false);
    });

    it('should validate Anthropic key format', () => {
      expect(keyManagement.validateKeyFormat('sk-ant-test-key', 'anthropic')).toBe(true);
      expect(keyManagement.validateKeyFormat('sk-test-key', 'anthropic')).toBe(false);
    });

    it('should reject short keys', () => {
      expect(keyManagement.validateKeyFormat('short', 'openai')).toBe(false);
    });

    it('should reject empty keys', () => {
      expect(keyManagement.validateKeyFormat('', 'openai')).toBe(false);
    });
  });
});
