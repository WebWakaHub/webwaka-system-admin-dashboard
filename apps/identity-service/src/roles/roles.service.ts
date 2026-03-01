import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';
import { EventsService } from '../events/events.service';
import { IdentityEvent } from '../common/enums/identity-event.enum';
import { ActorType, hasAuthorityOver } from '../common/enums/actor-type.enum';
import { JwtPayload } from '../common/dto/auth.dto';

/**
 * Roles Service
 *
 * Manages role assignment and revocation with:
 * - Actor hierarchy enforcement
 * - Tenant-scoped queries
 * - Event emission on all state changes
 */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Assign a role to a user.
   * Enforces actor hierarchy: can only assign roles at or below the assigner's level.
   */
  async assignRole(
    userId: string,
    roleId: string,
    currentUser: JwtPayload,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: currentUser.actorType === ActorType.SUPER_ADMIN
        ? { id: userId }
        : { id: userId, tenantId: currentUser.tenantId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User '${userId}' not found`);
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleId}' not found`);
    }

    // Enforce hierarchy: can only assign roles at or below own level
    if (!hasAuthorityOver(currentUser.actorType, role.actorType) &&
        currentUser.actorType !== role.actorType) {
      throw new ForbiddenException(
        `Cannot assign '${role.actorType}' level role`,
      );
    }

    // Check if role is already assigned
    const alreadyAssigned = user.roles?.some((r) => r.id === roleId);
    if (!alreadyAssigned) {
      user.roles = [...(user.roles || []), role];
      await this.userRepository.save(user);

      await this.eventsService.emit(IdentityEvent.ROLE_ASSIGNED, {
        userId,
        roleId,
        roleName: role.name,
        tenantId: user.tenantId,
        assignedBy: currentUser.sub,
      });
    }
  }

  /**
   * Revoke a role from a user.
   */
  async revokeRole(
    userId: string,
    roleId: string,
    currentUser: JwtPayload,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: currentUser.actorType === ActorType.SUPER_ADMIN
        ? { id: userId }
        : { id: userId, tenantId: currentUser.tenantId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User '${userId}' not found`);
    }

    user.roles = (user.roles || []).filter((r) => r.id !== roleId);
    await this.userRepository.save(user);

    await this.eventsService.emit(IdentityEvent.ROLE_REVOKED, {
      userId,
      roleId,
      tenantId: user.tenantId,
      revokedBy: currentUser.sub,
    });
  }

  /**
   * List all roles within the current tenant scope.
   */
  async findAll(currentUser: JwtPayload): Promise<Role[]> {
    const where: Record<string, any>[] = [];

    // System roles are visible to all
    where.push({ isSystem: true });

    // Tenant-specific roles
    if (currentUser.actorType !== ActorType.SUPER_ADMIN && currentUser.tenantId) {
      where.push({ tenantId: currentUser.tenantId });
    }

    return this.roleRepository.find({
      where,
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }
}
