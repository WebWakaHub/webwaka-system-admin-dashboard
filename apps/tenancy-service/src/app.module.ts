import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from './config/config.module';
import { TenantConfigService } from './config/tenant-config.service';
import { TenantsModule } from './tenants/tenants.module';
import { EventsModule } from './events/events.module';
import { OfflineModule } from './offline/offline.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { Tenant } from './database/entities/tenant.entity';
import { TenantConfig } from './database/entities/tenant-config.entity';
import { TenantFeatureFlag } from './database/entities/tenant-feature-flag.entity';

/**
 * AppModule — Root module for the Tenancy Service
 *
 * Wires together:
 * - TypeORM with PostgreSQL (RLS-enabled)
 * - JWT for tenant context validation
 * - TenantsModule for lifecycle management
 * - EventsModule for domain event emission
 * - OfflineModule for Offline-First resilience
 * - TenantMiddleware for request-level tenant resolution
 *
 * Nigeria-First: Conservative connection pool and timeout defaults.
 * Offline-First: OfflineModule ensures events are queued on failure.
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [TenantConfigService],
      useFactory: (config: TenantConfigService) => ({
        type: 'postgres',
        url: config.databaseUrl,
        entities: [Tenant, TenantConfig, TenantFeatureFlag],
        migrations: [__dirname + '/database/migrations/*.{ts,js}'],
        migrationsRun: true,
        synchronize: false,
        logging: !config.isProduction,
        extra: {
          max: config.databasePoolSize,             // Africa-First: 10 connections
          connectionTimeoutMillis: config.databaseConnectionTimeout, // Nigeria-First: 30s
          idleTimeoutMillis: 60000,
        },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [TenantConfigService],
      useFactory: (config: TenantConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn },
      }),
    }),
    TenantsModule,
    EventsModule,
    OfflineModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
