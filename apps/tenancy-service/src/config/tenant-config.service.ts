import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Tenant Configuration Service
 *
 * Provides typed access to environment-level configuration.
 * Separates infrastructure config (env vars) from tenant-level
 * config (stored in tenant_configs table via TenantsService).
 *
 * Nigeria-First: Conservative defaults for network timeouts,
 * connection pools, and retry intervals.
 * Offline-First: Sync interval and retry configuration.
 */
@Injectable()
export class TenantConfigService {
  constructor(private readonly configService: ConfigService) {}

  // ===== DATABASE =====

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', '');
  }

  get databasePoolSize(): number {
    // Africa-First: Conservative pool size for variable connectivity
    return this.configService.get<number>('DB_POOL_SIZE', 10);
  }

  get databaseConnectionTimeout(): number {
    // Nigeria-First: 30s timeout for high-latency connections
    return this.configService.get<number>('DB_CONNECTION_TIMEOUT', 30000);
  }

  // ===== JWT =====

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'webwaka-tenancy-secret');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '1h');
  }

  // ===== SERVICE =====

  get port(): number {
    return this.configService.get<number>('PORT', 3002);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // ===== OFFLINE / SYNC =====

  get offlineSyncRetryInterval(): number {
    // Nigeria-First: 5s retry for intermittent connectivity
    return this.configService.get<number>('OFFLINE_SYNC_RETRY_INTERVAL', 5000);
  }

  get offlineQueueMaxSize(): number {
    return this.configService.get<number>('OFFLINE_QUEUE_MAX_SIZE', 100);
  }

  // ===== NIGERIA-FIRST DEFAULTS =====

  get defaultLocale(): string {
    return this.configService.get<string>('DEFAULT_LOCALE', 'en-NG');
  }

  get defaultTimezone(): string {
    return this.configService.get<string>('DEFAULT_TIMEZONE', 'Africa/Lagos');
  }

  get defaultCurrency(): string {
    return this.configService.get<string>('DEFAULT_CURRENCY', 'NGN');
  }

  get defaultCountryCode(): string {
    return this.configService.get<string>('DEFAULT_COUNTRY_CODE', 'NG');
  }
}
