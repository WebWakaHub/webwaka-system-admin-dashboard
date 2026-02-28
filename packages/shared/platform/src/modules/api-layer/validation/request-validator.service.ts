/**
 * Request Validator Service
 * 
 * Validates incoming API requests for format, content, and structure.
 * Provides comprehensive validation with detailed error messages.
 */

import { ValidationResult, ValidationError } from '../types';

export class RequestValidatorService {
  /**
   * Validate request body
   * 
   * @param body - Request body to validate
   * @param schema - Validation schema
   * @returns Validation result
   */
  validateBody(body: any, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if body is present when required
    if (schema.required && !body) {
      errors.push({
        field: 'body',
        message: 'Request body is required',
      });
      return { valid: false, errors };
    }

    // Validate each field in the schema
    for (const [field, rules] of Object.entries(schema.fields || {})) {
      const value = body?.[field];

      // Check required fields
      if (rules.required && (value === undefined || value === null)) {
        errors.push({
          field,
          message: `Field '${field}' is required`,
        });
        continue;
      }

      // Skip validation if field is not present and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Validate type
      if (rules.type && !this.validateType(value, rules.type)) {
        errors.push({
          field,
          message: `Field '${field}' must be of type ${rules.type}`,
          value,
        });
      }

      // Validate string length
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({
            field,
            message: `Field '${field}' must be at least ${rules.minLength} characters`,
            value,
          });
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({
            field,
            message: `Field '${field}' must be at most ${rules.maxLength} characters`,
            value,
          });
        }
      }

      // Validate number range
      if (rules.type === 'number' && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({
            field,
            message: `Field '${field}' must be at least ${rules.min}`,
            value,
          });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({
            field,
            message: `Field '${field}' must be at most ${rules.max}`,
            value,
          });
        }
      }

      // Validate pattern (regex)
      if (rules.pattern && typeof value === 'string') {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors.push({
            field,
            message: `Field '${field}' does not match required pattern`,
            value,
          });
        }
      }

      // Validate enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `Field '${field}' must be one of: ${rules.enum.join(', ')}`,
          value,
        });
      }

      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          errors.push({
            field,
            message: customError,
            value,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate query parameters
   * 
   * @param query - Query parameters to validate
   * @param schema - Validation schema
   * @returns Validation result
   */
  validateQuery(query: any, schema: ValidationSchema): ValidationResult {
    // Query parameters are similar to body validation
    return this.validateBody(query, schema);
  }

  /**
   * Validate path parameters
   * 
   * @param params - Path parameters to validate
   * @param schema - Validation schema
   * @returns Validation result
   */
  validateParams(params: any, schema: ValidationSchema): ValidationResult {
    // Path parameters are similar to body validation
    return this.validateBody(params, schema);
  }

  /**
   * Validate type of a value
   * 
   * @param value - Value to validate
   * @param type - Expected type
   * @returns True if value matches type
   */
  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }

  /**
   * Validate tenant ID format
   * 
   * @param tenantId - Tenant ID to validate
   * @returns Validation result
   */
  validateTenantId(tenantId: string): ValidationResult {
    if (!tenantId || typeof tenantId !== 'string') {
      return {
        valid: false,
        errors: [{ field: 'tenantId', message: 'Tenant ID is required and must be a string' }],
      };
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return {
        valid: false,
        errors: [{ field: 'tenantId', message: 'Tenant ID must be a valid UUID', value: tenantId }],
      };
    }

    return { valid: true };
  }

  /**
   * Validate user ID format
   * 
   * @param userId - User ID to validate
   * @returns Validation result
   */
  validateUserId(userId: string): ValidationResult {
    if (!userId || typeof userId !== 'string') {
      return {
        valid: false,
        errors: [{ field: 'userId', message: 'User ID is required and must be a string' }],
      };
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return {
        valid: false,
        errors: [{ field: 'userId', message: 'User ID must be a valid UUID', value: userId }],
      };
    }

    return { valid: true };
  }
}

/**
 * Validation Schema
 * Defines validation rules for request fields.
 */
export interface ValidationSchema {
  required?: boolean;
  fields?: {
    [key: string]: FieldValidationRules;
  };
}

/**
 * Field Validation Rules
 * Defines validation rules for a single field.
 */
export interface FieldValidationRules {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: (value: any) => string | null;
}
