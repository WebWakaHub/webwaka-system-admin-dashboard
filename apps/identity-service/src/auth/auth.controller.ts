import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  AuthResponse,
} from '../common/dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Authentication Controller
 *
 * Provides endpoints for:
 * - POST /auth/login — Email/password login
 * - POST /auth/refresh — Token refresh
 * - POST /auth/logout — Logout (revoke refresh token)
 * - POST /auth/change-password — Change password
 *
 * Mobile-First: All responses are compact JSON for low-bandwidth.
 * Offline-First: JWT tokens enable stateless offline authentication.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Request() req: any,
    @Body() _loginDto: LoginDto,
  ): Promise<AuthResponse> {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(@Request() req: any): Promise<void> {
    return this.authService.logout(req.user.sub);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 204, description: 'Password changed' })
  @ApiResponse({ status: 403, description: 'Current password incorrect' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
