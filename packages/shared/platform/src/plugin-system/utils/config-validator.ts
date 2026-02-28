/**
 * Plugin Configuration Validator
 * Validates plugin configurations against schemas
 */

import { InvalidPluginConfigurationError } from '../errors';
import { ConfigOption } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Configuration Validator
 */
export class ConfigValidator {
  /**
   * Validate configuration against schema
   */
  validateConfiguration(
    config: Record<string, unknown>,
    schema: Record<string, ConfigOption>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const [key, option] of Object.entries(schema)) {
      if (option.required && !(key in config)) {
        errors.push(`Required field missing: ${key}`);
      }
    }

    // Validate provided fields
    for (const [key, value] of Object.entries(config)) {
      if (!(key in schema)) {
        warnings.push(`Unknown configuration field: ${key}`);
        continue;
      }

      const option = schema[key];
      const validationError = this.validateField(key, value, option);

      if (validationError) {
        errors.push(validationError);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate a single field
   */
  private validateField(key: string, value: unknown, option: ConfigOption): string | null {
    // Type validation
    if (value !== null && value !== undefined) {
      const actualType = typeof value;
      if (actualType !== option.type && option.type !== 'object') {
        return `Field ${key}: expected ${option.type}, got ${actualType}`;
      }
    }

    // Type-specific validation
    switch (option.type) {
      case 'string':
        return this.validateString(key, value as string, option);
      case 'number':
        return this.validateNumber(key, value as number, option);
      case 'boolean':
        return this.validateBoolean(key, value as boolean, option);
      case 'array':
        return this.validateArray(key, value as unknown[], option);
      case 'object':
        return this.validateObject(key, value as Record<string, unknown>, option);
      default:
        return null;
    }
  }

  /**
   * Validate string field
   */
  private validateString(key: string, value: string, option: ConfigOption): string | null {
    if (typeof value !== 'string') {
      return `Field ${key}: expected string`;
    }

    if (option.validation?.pattern) {
      const pattern = new RegExp(option.validation.pattern);
      if (!pattern.test(value)) {
        return `Field ${key}: does not match pattern ${option.validation.pattern}`;
      }
    }

    if (option.validation?.enum) {
      if (!option.validation.enum.includes(value)) {
        return `Field ${key}: must be one of ${option.validation.enum.join(', ')}`;
      }
    }

    return null;
  }

  /**
   * Validate number field
   */
  private validateNumber(key: string, value: number, option: ConfigOption): string | null {
    if (typeof value !== 'number') {
      return `Field ${key}: expected number`;
    }

    if (option.validation?.min !== undefined && value < option.validation.min) {
      return `Field ${key}: must be >= ${option.validation.min}`;
    }

    if (option.validation?.max !== undefined && value > option.validation.max) {
      return `Field ${key}: must be <= ${option.validation.max}`;
    }

    if (option.validation?.enum) {
      if (!option.validation.enum.includes(value)) {
        return `Field ${key}: must be one of ${option.validation.enum.join(', ')}`;
      }
    }

    return null;
  }

  /**
   * Validate boolean field
   */
  private validateBoolean(key: string, value: boolean, _option: ConfigOption): string | null {
    if (typeof value !== 'boolean') {
      return `Field ${key}: expected boolean`;
    }

    return null;
  }

  /**
   * Validate array field
   */
  private validateArray(key: string, value: unknown[], _option: ConfigOption): string | null {
    if (!Array.isArray(value)) {
      return `Field ${key}: expected array`;
    }

    return null;
  }

  /**
   * Validate object field
   */
  private validateObject(
    key: string,
    value: Record<string, unknown>,
    _option: ConfigOption
  ): string | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return `Field ${key}: expected object`;
    }

    return null;
  }

  /**
   * Validate and throw on error
   */
  validateOrThrow(
    config: Record<string, unknown>,
    schema: Record<string, ConfigOption>
  ): void {
    const result = this.validateConfiguration(config, schema);

    if (!result.valid) {
      throw new InvalidPluginConfigurationError(
        `Configuration validation failed: ${result.errors?.join('; ')}`,
        { errors: result.errors }
      );
    }
  }
}

/**
 * Global validator instance
 */
export const configValidator = new ConfigValidator();
