/**
 * Authentication Service
 * 
 * Handles JWT-based authentication for API requests.
 * Extracts and validates JWT tokens, extracts tenantId and userId.
 */

import { JwtPayload, AuthenticationResult, ApiRequestContext } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AuthenticationService {
  private jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  /**
   * Authenticate a request by validating the JWT token
   * 
   * @param authHeader - The Authorization header value
   * @param ipAddress - The client IP address
   * @param userAgent - The client User-Agent
   * @returns Authentication result with context or error
   */
  async authenticate(
    authHeader: string | undefined,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthenticationResult> {
    // Check if Authorization header is present
    if (!authHeader) {
      return {
        success: false,
        error: 'Missing Authorization header',
      };
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return {
        success: false,
        error: 'Invalid Authorization header format. Expected: Bearer <token>',
      };
    }

    const token = parts[1];

    try {
      // Validate and decode JWT token
      const payload = await this.validateJwt(token);

      // Extract tenantId and userId
      const tenantId = payload.tenantId;
      const userId = payload.sub;

      if (!tenantId || !userId) {
        return {
          success: false,
          error: 'Invalid token: missing tenantId or userId',
        };
      }

      // Create request context
      const context: ApiRequestContext = {
        tenantId,
        userId,
        requestId: uuidv4(),
        timestamp: new Date(),
        ipAddress,
        userAgent,
      };

      return {
        success: true,
        context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      };
    }
  }

  /**
   * Validate and decode a JWT token
   * 
   * @param token - The JWT token to validate
   * @returns Decoded JWT payload
   * @throws Error if token is invalid
   */
  private async validateJwt(token: string): Promise<JwtPayload> {
    // Simple JWT validation (in production, use a proper JWT library like jsonwebtoken)
    // This is a minimal implementation for demonstration
    
    try {
      // Split token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode payload (base64url decode)
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      );

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      // Verify signature (simplified - in production use proper crypto verification)
      // For now, we just check if the token is well-formed
      if (!payload.sub || !payload.tenantId) {
        throw new Error('Invalid token payload: missing required fields');
      }

      return payload as JwtPayload;
    } catch (error) {
      throw new Error(`JWT validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract tenant ID from a JWT token without full validation
   * Useful for rate limiting before full authentication
   * 
   * @param authHeader - The Authorization header value
   * @returns Tenant ID or null if not found
   */
  extractTenantId(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    try {
      const tokenParts = parts[1].split('.');
      if (tokenParts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64url').toString('utf-8')
      );

      return payload.tenantId || null;
    } catch {
      return null;
    }
  }
}
