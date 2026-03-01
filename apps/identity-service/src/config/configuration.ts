/**
 * Application Configuration
 *
 * Nigeria-First defaults:
 * - Default locale: en-NG
 * - Default timezone: Africa/Lagos
 * - Default currency: NGN
 *
 * Offline-First: JWT tokens are designed for stateless
 * verification, enabling offline authentication.
 */
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'webwaka',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'webwaka_identity',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.DB_LOGGING === 'true',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'webwaka-jwt-secret-change-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  // Nigeria-First Defaults
  nigeriaFirst: {
    defaultLocale: 'en-NG',
    defaultCurrency: 'NGN',
    defaultTimezone: 'Africa/Lagos',
    defaultCountryCode: '+234',
  },

  // Offline-First Configuration
  offlineFirst: {
    syncRetryInterval: parseInt(process.env.SYNC_RETRY_INTERVAL || '5000', 10),
    maxRetries: parseInt(process.env.SYNC_MAX_RETRIES || '5', 10),
    queueMaxSize: parseInt(process.env.OFFLINE_QUEUE_MAX_SIZE || '1000', 10),
  },

  // Bcrypt Configuration
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
});
