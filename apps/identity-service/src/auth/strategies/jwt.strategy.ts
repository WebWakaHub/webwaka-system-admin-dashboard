import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../common/dto/auth.dto';

/**
 * JWT Strategy for Passport.js
 *
 * Validates JWT tokens from the Authorization header.
 * Extracts actor type, tenant ID, and permissions from the payload.
 *
 * Offline-First: JWT tokens are stateless and can be verified
 * without a database call, enabling offline authentication
 * on the client side using the same secret.
 *
 * The JWT payload includes:
 * - sub: user ID
 * - email: user email
 * - actorType: position in the 5-level hierarchy
 * - tenantId: tenant scope (null for Super Admin)
 * - permissions: array of permission strings
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub || !payload.actorType) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      actorType: payload.actorType,
      tenantId: payload.tenantId,
      partnerId: payload.partnerId,
      permissions: payload.permissions || [],
    };
  }
}
