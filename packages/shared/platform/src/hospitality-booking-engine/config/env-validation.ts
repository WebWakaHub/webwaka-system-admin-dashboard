/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at application startup.
 * Fails fast if required variables are missing or invalid.
 * 
 * @module hospitality-booking-engine/config/env-validation
 * @author webwakaagent4
 */

import logger from '../utils/logger';

interface EnvSchema {
  [key: string]: {
    required: boolean;
    type: 'string' | 'number' | 'boolean';
    default?: any;
    validate?: (value: any) => boolean;
  };
}

const envSchema: EnvSchema = {
  // Node environment
  NODE_ENV: {
    required: true,
    type: 'string',
    validate: (value) => ['development', 'test', 'production'].includes(value),
  },
  
  // Application
  PORT: {
    required: false,
    type: 'number',
    default: 3000,
  },
  LOG_LEVEL: {
    required: false,
    type: 'string',
    default: 'info',
    validate: (value) => ['error', 'warn', 'info', 'http', 'debug'].includes(value),
  },
  
  // Database
  DB_HOST: {
    required: true,
    type: 'string',
  },
  DB_PORT: {
    required: true,
    type: 'number',
  },
  DB_NAME: {
    required: true,
    type: 'string',
  },
  DB_USER: {
    required: true,
    type: 'string',
  },
  DB_PASSWORD: {
    required: true,
    type: 'string',
  },
  
  // Redis
  REDIS_HOST: {
    required: true,
    type: 'string',
  },
  REDIS_PORT: {
    required: true,
    type: 'number',
  },
  
  // Payment Gateways
  PAYSTACK_SECRET_KEY: {
    required: true,
    type: 'string',
    validate: (value) => value.startsWith('sk_'),
  },
  FLUTTERWAVE_SECRET_KEY: {
    required: true,
    type: 'string',
    validate: (value) => value.startsWith('FLWSECK-'),
  },
  INTERSWITCH_CLIENT_ID: {
    required: true,
    type: 'string',
  },
  INTERSWITCH_CLIENT_SECRET: {
    required: true,
    type: 'string',
  },
  
  // SMS Provider
  TERMII_API_KEY: {
    required: true,
    type: 'string',
  },
  
  // Email Provider
  SMTP_HOST: {
    required: true,
    type: 'string',
  },
  SMTP_PORT: {
    required: true,
    type: 'number',
  },
  SMTP_USER: {
    required: true,
    type: 'string',
  },
  SMTP_PASSWORD: {
    required: true,
    type: 'string',
  },
  
  // Event Bus
  NATS_URL: {
    required: true,
    type: 'string',
    validate: (value) => value.startsWith('nats://'),
  },
};

/**
 * Validate environment variables
 */
export function validateEnv(): void {
  const errors: string[] = [];
  
  for (const [key, schema] of Object.entries(envSchema)) {
    const value = process.env[key];
    
    // Check if required variable is missing
    if (schema.required && !value) {
      errors.push(`Missing required environment variable: ${key}`);
      continue;
    }
    
    // Set default if not provided
    if (!value && schema.default !== undefined) {
      process.env[key] = String(schema.default);
      continue;
    }
    
    // Skip validation if value not provided and not required
    if (!value) {
      continue;
    }
    
    // Type validation
    if (schema.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`Environment variable ${key} must be a number, got: ${value}`);
        continue;
      }
    }
    
    if (schema.type === 'boolean') {
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        errors.push(`Environment variable ${key} must be a boolean, got: ${value}`);
        continue;
      }
    }
    
    // Custom validation
    if (schema.validate && !schema.validate(value)) {
      errors.push(`Environment variable ${key} failed validation: ${value}`);
    }
  }
  
  // Fail fast if errors
  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach((error) => logger.error(`  - ${error}`));
    process.exit(1);
  }
  
  logger.info('Environment validation passed');
}

/**
 * Get typed environment variable
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get typed environment variable as number
 */
export function getEnvNumber(key: string): number {
  const value = getEnv(key);
  const numValue = Number(value);
  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${key} is not a valid number: ${value}`);
  }
  return numValue;
}

/**
 * Get typed environment variable as boolean
 */
export function getEnvBoolean(key: string): boolean {
  const value = getEnv(key).toLowerCase();
  return value === 'true' || value === '1';
}

export default {
  validateEnv,
  getEnv,
  getEnvNumber,
  getEnvBoolean,
};
