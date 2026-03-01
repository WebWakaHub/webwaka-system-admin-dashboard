import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from '../common/dto/create-user.dto';
import { UpdateUserDto } from '../common/dto/update-user.dto';
import { EventsService } from '../events/events.service';
import { IdentityEvent } from '../common/enums/identity-event.enum';
import { ActorType, hasAuthorityOver } from '../common/enums/actor-type.enum';
import { JwtPayload } from '../common/dto/auth.dto';

/**
 * Users Service
 *
 * Implements User CRUD operations with:
 * - Tenant-scoped queries (RLS)
 * - Actor hierarchy enforcement
 * - Event emission on all state changes
 * - Nigeria-First defaults
 * - Offline-First sync status tracking
 *
 * All queries are tenant-scoped except for Super Admin.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Create a new user.
   *
   * Enforces:
   * - Actor hierarchy: Creator must have authority over the new user's actor type
   * - Tenant isolation: Non-Super Admin users must belong to a tenant
   * - Unique email per tenant
   * - Nigeria-First defaults for locale and timezone
   */
  async create(
    createUserDto: CreateUserDto,
    currentUser: JwtPayload,
  ): Promise<Omit<User, 'passwordHash'>> {
    // Enforce actor hierarchy
    if (!hasAuthorityOver(currentUser.actorType, createUserDto.actorType)) {
      throw new ForbiddenException(
        `Actor type '${currentUser.actorType}' cannot create '${createUserDto.actorType}' users`,
      );
    }

    // Enforce tenant requirement for non-Super Admin
    if (
      createUserDto.actorType !== ActorType.SUPER_ADMIN &&
      !createUserDto.tenantId
    ) {
      throw new ForbiddenException(
        'Non-Super Admin users must have a tenant ID',
      );
    }

    // Determine tenant scope
    const tenantId =
      createUserDto.actorType === ActorType.SUPER_ADMIN
        ? null
        : createUserDto.tenantId || currentUser.tenantId;

    // Check for duplicate email within tenant
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email, tenantId },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists in this tenant');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 12;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user with Nigeria-First defaults
    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phoneNumber: createUserDto.phoneNumber,
      actorType: createUserDto.actorType,
      tenantId,
      partnerId: createUserDto.partnerId || currentUser.partnerId,
      locale: createUserDto.locale || 'en-NG',
      timezone: createUserDto.timezone || 'Africa/Lagos',
      syncStatus: 'synced',
    });

    const savedUser = await this.userRepository.save(user);

    // Emit user created event
    await this.eventsService.emit(IdentityEvent.USER_CREATED, {
      userId: savedUser.id,
      email: savedUser.email,
      actorType: savedUser.actorType,
      tenantId: savedUser.tenantId,
    });

    const { passwordHash: _, ...result } = savedUser;
    return result as Omit<User, 'passwordHash'>;
  }

  /**
   * Find all users within the current tenant scope.
   * Super Admin sees all users across all tenants.
   */
  async findAll(
    currentUser: JwtPayload,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ users: Omit<User, 'passwordHash'>[]; total: number }> {
    const where: Record<string, any> = {};

    // Apply tenant filter (Super Admin bypasses)
    if (currentUser.actorType !== ActorType.SUPER_ADMIN) {
      where.tenantId = currentUser.tenantId;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      select: [
        'id', 'email', 'firstName', 'lastName', 'phoneNumber',
        'actorType', 'tenantId', 'partnerId', 'isActive',
        'isEmailVerified', 'locale', 'timezone', 'syncStatus',
        'lastLoginAt', 'createdAt', 'updatedAt',
      ],
    });

    return { users: users as Omit<User, 'passwordHash'>[], total };
  }

  /**
   * Find a single user by ID within the current tenant scope.
   */
  async findOne(
    id: string,
    currentUser: JwtPayload,
  ): Promise<Omit<User, 'passwordHash'>> {
    const where: Record<string, any> = { id };

    // Apply tenant filter
    if (currentUser.actorType !== ActorType.SUPER_ADMIN) {
      where.tenantId = currentUser.tenantId;
    }

    const user = await this.userRepository.findOne({
      where,
      select: [
        'id', 'email', 'firstName', 'lastName', 'phoneNumber',
        'actorType', 'tenantId', 'partnerId', 'isActive',
        'isEmailVerified', 'locale', 'timezone', 'syncStatus',
        'lastLoginAt', 'createdAt', 'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    return user as Omit<User, 'passwordHash'>;
  }

  /**
   * Update a user within the current tenant scope.
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: JwtPayload,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({
      where: currentUser.actorType === ActorType.SUPER_ADMIN
        ? { id }
        : { id, tenantId: currentUser.tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    // Enforce actor hierarchy for type changes
    if (
      updateUserDto.actorType &&
      !hasAuthorityOver(currentUser.actorType, updateUserDto.actorType)
    ) {
      throw new ForbiddenException(
        `Cannot change user to actor type '${updateUserDto.actorType}'`,
      );
    }

    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);

    // Emit user updated event
    await this.eventsService.emit(IdentityEvent.USER_UPDATED, {
      userId: savedUser.id,
      changes: Object.keys(updateUserDto),
      tenantId: savedUser.tenantId,
    });

    const { passwordHash: _, ...result } = savedUser;
    return result as Omit<User, 'passwordHash'>;
  }

  /**
   * Deactivate a user (soft delete).
   * Does not remove the user from the database.
   */
  async deactivate(
    id: string,
    currentUser: JwtPayload,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: currentUser.actorType === ActorType.SUPER_ADMIN
        ? { id }
        : { id, tenantId: currentUser.tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    // Cannot deactivate a user with higher authority
    if (!hasAuthorityOver(currentUser.actorType, user.actorType)) {
      throw new ForbiddenException(
        `Cannot deactivate a '${user.actorType}' user`,
      );
    }

    user.isActive = false;
    user.refreshToken = null; // Revoke all sessions
    await this.userRepository.save(user);

    await this.eventsService.emit(IdentityEvent.USER_DEACTIVATED, {
      userId: user.id,
      tenantId: user.tenantId,
      deactivatedBy: currentUser.sub,
    });
  }
}
