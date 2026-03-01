import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from '../database/entities/tenant.entity';
import { TenantConfig } from '../database/entities/tenant-config.entity';
import { TenantFeatureFlag } from '../database/entities/tenant-feature-flag.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantConfig, TenantFeatureFlag]),
    EventsModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
