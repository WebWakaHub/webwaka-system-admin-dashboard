/**
 * Config Validator Unit Tests
 */

import { ConfigValidator } from '../../src/plugin-system/utils/config-validator';
import { InvalidPluginConfigurationError } from '../../src/plugin-system/errors';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  describe('validateConfiguration', () => {
    it('should validate correct configuration', () => {
      const config = { apiKey: 'test-key', enabled: true };
      const schema = {
        apiKey: { type: 'string' as const, required: true },
        enabled: { type: 'boolean' as const, required: false },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect missing required fields', () => {
      const config = { enabled: true };
      const schema = {
        apiKey: { type: 'string' as const, required: true },
        enabled: { type: 'boolean' as const, required: false },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('Required field missing');
    });

    it('should detect unknown fields', () => {
      const config = { apiKey: 'test', unknown: 'value' };
      const schema = {
        apiKey: { type: 'string' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('Unknown configuration field');
    });

    it('should validate type mismatch', () => {
      const config = { apiKey: 123 };
      const schema = {
        apiKey: { type: 'string' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('string validation', () => {
    it('should validate string pattern', () => {
      const config = { email: 'test@example.com' };
      const schema = {
        email: {
          type: 'string' as const,
          required: true,
          validation: {
            pattern: '^[^@]+@[^@]+\\.[^@]+$',
          },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid pattern', () => {
      const config = { email: 'invalid-email' };
      const schema = {
        email: {
          type: 'string' as const,
          required: true,
          validation: {
            pattern: '^[^@]+@[^@]+\\.[^@]+$',
          },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('does not match pattern');
    });

    it('should validate enum values', () => {
      const config = { environment: 'production' };
      const schema = {
        environment: {
          type: 'string' as const,
          required: true,
          validation: {
            enum: ['development', 'staging', 'production'],
          },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid enum value', () => {
      const config = { environment: 'invalid' };
      const schema = {
        environment: {
          type: 'string' as const,
          required: true,
          validation: {
            enum: ['development', 'staging', 'production'],
          },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('must be one of');
    });
  });

  describe('number validation', () => {
    it('should validate number range', () => {
      const config = { timeout: 5000 };
      const schema = {
        timeout: {
          type: 'number' as const,
          required: true,
          validation: { min: 1000, max: 30000 },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
    });

    it('should reject number below minimum', () => {
      const config = { timeout: 500 };
      const schema = {
        timeout: {
          type: 'number' as const,
          required: true,
          validation: { min: 1000 },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('must be >=');
    });

    it('should reject number above maximum', () => {
      const config = { timeout: 50000 };
      const schema = {
        timeout: {
          type: 'number' as const,
          required: true,
          validation: { max: 30000 },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('must be <=');
    });

    it('should validate number enum', () => {
      const config = { level: 2 };
      const schema = {
        level: {
          type: 'number' as const,
          required: true,
          validation: { enum: [1, 2, 3] },
        },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
    });
  });

  describe('boolean validation', () => {
    it('should validate boolean value', () => {
      const config = { enabled: true };
      const schema = {
        enabled: { type: 'boolean' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
    });

    it('should reject non-boolean value', () => {
      const config = { enabled: 'true' };
      const schema = {
        enabled: { type: 'boolean' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
    });
  });

  describe('array validation', () => {
    it('should validate array value', () => {
      const config = { items: [1, 2, 3] };
      const schema = {
        items: { type: 'array' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
    });

    it('should reject non-array value', () => {
      const config = { items: 'not-array' };
      const schema = {
        items: { type: 'array' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
    });
  });

  describe('object validation', () => {
    it('should validate object value', () => {
      const config = { settings: { key: 'value' } };
      const schema = {
        settings: { type: 'object' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
    });

    it('should reject non-object value', () => {
      const config = { settings: 'not-object' };
      const schema = {
        settings: { type: 'object' as const, required: true },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
    });
  });

  describe('validateOrThrow', () => {
    it('should not throw for valid configuration', () => {
      const config = { apiKey: 'test' };
      const schema = {
        apiKey: { type: 'string' as const, required: true },
      };

      expect(() => {
        validator.validateOrThrow(config, schema);
      }).not.toThrow();
    });

    it('should throw for invalid configuration', () => {
      const config = { apiKey: 123 };
      const schema = {
        apiKey: { type: 'string' as const, required: true },
      };

      expect(() => {
        validator.validateOrThrow(config, schema);
      }).toThrow(InvalidPluginConfigurationError);
    });

    it('should include error details in thrown error', () => {
      const config = {};
      const schema = {
        apiKey: { type: 'string' as const, required: true },
      };

      try {
        validator.validateOrThrow(config, schema);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidPluginConfigurationError);
        expect((error as InvalidPluginConfigurationError).message).toContain('Required field');
      }
    });
  });

  describe('complex configuration', () => {
    it('should validate complex configuration', () => {
      const config = {
        apiKey: 'test-key',
        enabled: true,
        timeout: 5000,
        environment: 'production',
        retries: [1, 2, 3],
        settings: { nested: 'value' },
      };

      const schema = {
        apiKey: { type: 'string' as const, required: true },
        enabled: { type: 'boolean' as const, required: true },
        timeout: {
          type: 'number' as const,
          required: true,
          validation: { min: 1000, max: 30000 },
        },
        environment: {
          type: 'string' as const,
          required: true,
          validation: { enum: ['development', 'staging', 'production'] },
        },
        retries: { type: 'array' as const, required: false },
        settings: { type: 'object' as const, required: false },
      };

      const result = validator.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });
});
