import { SetMetadata } from '@nestjs/common';
import { ActorType } from '../common/enums/actor-type.enum';

export const ACTOR_TYPES_KEY = 'actorTypes';

/**
 * Decorator to restrict route access to specific actor types.
 *
 * Usage:
 *   @ActorTypes(ActorType.SUPER_ADMIN, ActorType.TENANT_ADMIN)
 *   @UseGuards(JwtAuthGuard, ActorTypeGuard)
 *   async adminOnlyEndpoint() { ... }
 */
export const ActorTypes = (...actorTypes: ActorType[]) =>
  SetMetadata(ACTOR_TYPES_KEY, actorTypes);
