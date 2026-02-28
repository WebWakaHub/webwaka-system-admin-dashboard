/**
 * Unit Tests for Request Validator Service
 * 
 * Tests request validation, type checking, and error messages.
 */

import { RequestValidatorService } from '../../validation/request-validator.service';

describe('RequestValidatorService', () => {
  let validator: RequestValidatorService;

  beforeEach(() => {
    validator = new RequestValidatorService();
  });

  describe('validateBody', () => {
    it('should return valid when body is not required and missing', () => {
      const schema = { required: false };
      const result = validator.validateBody(undefined, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should return error when body is required but missing', () => {
      const schema = { required: true };
      const result = validator.validateBody(undefined, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].field).toBe('body');
      expect(result.errors?.[0].message).toContain('required');
    });

    it('should validate required fields', () => {
      const schema = {
        fields: {
          name: { required: true, type: 'string' as const },
        },
      };
      const result = validator.validateBody({}, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].field).toBe('name');
      expect(result.errors?.[0].message).toContain('required');
    });

    it('should validate string type', () => {
      const schema = {
        fields: {
          name: { type: 'string' as const },
        },
      };
      const result = validator.validateBody({ name: 123 }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].field).toBe('name');
      expect(result.errors?.[0].message).toContain('type string');
    });

    it('should validate number type', () => {
      const schema = {
        fields: {
          age: { type: 'number' as const },
        },
      };
      const result = validator.validateBody({ age: 'twenty' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].field).toBe('age');
      expect(result.errors?.[0].message).toContain('type number');
    });

    it('should validate boolean type', () => {
      const schema = {
        fields: {
          active: { type: 'boolean' as const },
        },
      };
      const result = validator.validateBody({ active: 'true' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].field).toBe('active');
    });

    it('should validate array type', () => {
      const schema = {
        fields: {
          tags: { type: 'array' as const },
        },
      };
      const result = validator.validateBody({ tags: 'tag1,tag2' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].field).toBe('tags');
    });

    it('should validate object type', () => {
      const schema = {
        fields: {
          metadata: { type: 'object' as const },
        },
      };
      const result = validator.validateBody({ metadata: 'invalid' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].field).toBe('metadata');
    });

    it('should validate string minLength', () => {
      const schema = {
        fields: {
          name: { type: 'string' as const, minLength: 3 },
        },
      };
      const result = validator.validateBody({ name: 'ab' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('at least 3 characters');
    });

    it('should validate string maxLength', () => {
      const schema = {
        fields: {
          name: { type: 'string' as const, maxLength: 10 },
        },
      };
      const result = validator.validateBody({ name: 'verylongname' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('at most 10 characters');
    });

    it('should validate number min', () => {
      const schema = {
        fields: {
          age: { type: 'number' as const, min: 18 },
        },
      };
      const result = validator.validateBody({ age: 15 }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('at least 18');
    });

    it('should validate number max', () => {
      const schema = {
        fields: {
          age: { type: 'number' as const, max: 100 },
        },
      };
      const result = validator.validateBody({ age: 150 }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('at most 100');
    });

    it('should validate pattern (regex)', () => {
      const schema = {
        fields: {
          email: { type: 'string' as const, pattern: '^[^@]+@[^@]+\\.[^@]+$' },
        },
      };
      const result = validator.validateBody({ email: 'invalid-email' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('does not match required pattern');
    });

    it('should validate enum values', () => {
      const schema = {
        fields: {
          status: { type: 'string' as const, enum: ['active', 'inactive', 'pending'] },
        },
      };
      const result = validator.validateBody({ status: 'deleted' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('must be one of');
    });

    it('should pass validation with valid data', () => {
      const schema = {
        fields: {
          name: { required: true, type: 'string' as const, minLength: 3, maxLength: 50 },
          age: { type: 'number' as const, min: 0, max: 150 },
          email: { type: 'string' as const, pattern: '^[^@]+@[^@]+\\.[^@]+$' },
        },
      };
      const result = validator.validateBody({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      }, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });

  describe('validateTenantId', () => {
    it('should return error when tenantId is missing', () => {
      const result = validator.validateTenantId('');

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('required');
    });

    it('should return error when tenantId is not a string', () => {
      const result = validator.validateTenantId(123 as any);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('must be a string');
    });

    it('should return error when tenantId is not a valid UUID', () => {
      const result = validator.validateTenantId('invalid-uuid');

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('valid UUID');
    });

    it('should pass validation with valid UUID', () => {
      const result = validator.validateTenantId('550e8400-e29b-41d4-a716-446655440000');

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });

  describe('validateUserId', () => {
    it('should return error when userId is missing', () => {
      const result = validator.validateUserId('');

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('required');
    });

    it('should return error when userId is not a valid UUID', () => {
      const result = validator.validateUserId('not-a-uuid');

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toContain('valid UUID');
    });

    it('should pass validation with valid UUID', () => {
      const result = validator.validateUserId('123e4567-e89b-12d3-a456-426614174000');

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });
});
