import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 *
 * Protects routes by requiring a valid JWT Bearer token.
 * Uses the JwtStrategy to validate tokens.
 *
 * Offline-First: On the client side, cached JWT tokens
 * can be used for offline authentication without this guard.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
