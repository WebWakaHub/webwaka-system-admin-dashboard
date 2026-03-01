import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TenantPlan } from '../enums/tenant-status.enum';
import { CreateTenantDto } from './create-tenant.dto';

/**
 * Update Tenant DTO
 * Partial version of CreateTenantDto — all fields optional.
 */
export class UpdateTenantDto extends PartialType(CreateTenantDto) {}

/**
 * Suspend Tenant DTO
 */
export class SuspendTenantDto {
  @ApiProperty({ example: 'Payment overdue for 30 days' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

/**
 * Tenant Config DTO
 * For setting a single configuration key-value pair.
 */
export class SetTenantConfigDto {
  @ApiProperty({ example: 'payment.gateway' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key: string;

  @ApiProperty({ example: 'paystack' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @ApiPropertyOptional({ example: 'Primary payment gateway provider' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

/**
 * Feature Flag DTO
 * For enabling/disabling a feature flag for a tenant.
 */
export class SetFeatureFlagDto {
  @ApiProperty({ example: 'domain.ecommerce' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  feature: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ example: { rolloutPercentage: 100 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Tenant Onboarding DTO
 * Completes the tenant onboarding workflow.
 */
export class CompleteTenantOnboardingDto {
  @ApiProperty({ example: 'admin-user-uuid' })
  @IsString()
  @IsNotEmpty()
  adminUserId: string;

  @ApiPropertyOptional({ description: 'Initial feature flags to enable' })
  @IsOptional()
  initialFeatures?: string[];

  @ApiPropertyOptional({ description: 'Initial configuration values' })
  @IsOptional()
  initialConfig?: Record<string, string>;
}
