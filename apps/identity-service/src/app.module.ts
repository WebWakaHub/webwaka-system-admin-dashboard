import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { EventsModule } from './events/events.module';
import { OfflineModule } from './offline/offline.module';
import { User } from './database/entities/user.entity';
import { Role } from './database/entities/role.entity';
import { Permission } from './database/entities/permission.entity';

/**
 * Application Root Module
 *
 * WebWaka Identity Service — NestJS Microservice
 *
 * Wires together all modules:
 * - AuthModule: Passport.js + JWT authentication
 * - UsersModule: User CRUD with tenant-scoped RLS
 * - RolesModule: Role management with hierarchy enforcement
 * - EventsModule: Domain event emission
 * - OfflineModule: Offline queue for failed operations
 *
 * Configuration:
 * - TypeORM with PostgreSQL
 * - Nigeria-First defaults (en-NG, Africa/Lagos, NGN)
 * - Offline-First architecture
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [User, Role, Permission],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        // Connection pool settings for Africa-First (low-resource environments)
        extra: {
          max: 10, // Conservative pool size
          connectionTimeoutMillis: 30000, // 30s timeout for slow networks
        },
      }),
    }),

    // Feature Modules
    OfflineModule,
    EventsModule,
    AuthModule,
    UsersModule,
    RolesModule,
  ],
})
export class AppModule {}
