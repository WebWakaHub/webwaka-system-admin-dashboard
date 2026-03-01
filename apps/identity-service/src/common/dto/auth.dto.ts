import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActorType } from '../enums/actor-type.enum';

/**
 * DTO for login request.
 */
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * DTO for token refresh request.
 */
export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token issued at login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

/**
 * DTO for password change request.
 */
export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

/**
 * Auth response returned after successful login or token refresh.
 *
 * JWT payload includes:
 * - sub: user ID
 * - email: user email
 * - actorType: the 5-level hierarchy position
 * - tenantId: tenant scope (null for Super Admin)
 * - permissions: array of permission strings
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    actorType: ActorType;
    tenantId: string | null;
    permissions: string[];
  };
}

/**
 * JWT Payload structure.
 * Included in every JWT token for stateless authentication.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  actorType: ActorType;
  tenantId: string | null;
  partnerId: string | null;
  permissions: string[];
  iat?: number;
  exp?: number;
}
