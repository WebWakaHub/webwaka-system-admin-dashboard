import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ActorType } from '../common/enums/actor-type.enum';

/**
 * Tenant Guard
 *
 * Ensures that non-Super Admin actors have a valid tenant ID.
 * This guard enforces the constitutional requirement that all
 * queries (except Super Admin) are tenant-scoped via RLS.
 *
 * Must be used AFTER JwtAuthGuard.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Super Admin bypasses tenant requirement
    if (user.actorType === ActorType.SUPER_ADMIN) {
      return true;
    }

    // All other actors MUST have a tenant ID
    if (!user.tenantId) {
      throw new ForbiddenException(
        'Tenant context required. Non-Super Admin actors must have a tenant ID.',
      );
    }

    return true;
  }
}
