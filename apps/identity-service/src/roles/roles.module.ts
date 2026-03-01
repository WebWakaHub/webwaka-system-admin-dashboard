import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';
import { EventsModule } from '../events/events.module';

/**
 * Roles Module
 *
 * Provides role management with tenant-scoped queries
 * and actor hierarchy enforcement.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Role, User]), EventsModule],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
