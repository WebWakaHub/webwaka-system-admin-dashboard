import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActorType, ACTOR_HIERARCHY_LEVEL } from '../common/enums/actor-type.enum';
import { ACTOR_TYPES_KEY } from '../decorators/actor-types.decorator';

/**
 * Actor Type Guard
 *
 * Enforces the 5-level actor hierarchy on protected routes.
 * Only actors at or above the required level can access the route.
 *
 * Usage:
 *   @ActorTypes(ActorType.TENANT_ADMIN, ActorType.PARTNER, ActorType.SUPER_ADMIN)
 *   @UseGuards(JwtAuthGuard, ActorTypeGuard)
 *   async someEndpoint() { ... }
 */
@Injectable()
export class ActorTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredActorTypes = this.reflector.getAllAndOverride<ActorType[]>(
      ACTOR_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredActorTypes || requiredActorTypes.length === 0) {
      return true; // No actor type restriction
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.actorType) {
      throw new ForbiddenException('No actor type found in token');
    }

    const hasRequiredType = requiredActorTypes.includes(user.actorType);
    if (!hasRequiredType) {
      throw new ForbiddenException(
        `Actor type '${user.actorType}' does not have access. Required: ${requiredActorTypes.join(', ')}`,
      );
    }

    return true;
  }
}
