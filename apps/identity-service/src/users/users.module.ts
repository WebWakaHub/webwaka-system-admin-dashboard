import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';
import { EventsModule } from '../events/events.module';

/**
 * Users Module
 *
 * Provides user CRUD operations with tenant-scoped queries,
 * actor hierarchy enforcement, and event emission.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), EventsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
