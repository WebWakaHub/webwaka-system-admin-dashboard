import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  IsPhoneNumber,
  MaxLength,
  MinLength,
  Matches,
  IsObject,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantPlan } from '../enums/tenant-status.enum';

/**
 * Create Tenant DTO
 *
 * Validates the request body for creating a new tenant.
 * Nigeria-First: Default values for countryCode, locale, timezone, currency.
 */
export class CreateTenantDto {
  @ApiProperty({ example: 'Dangote Industries' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'dangote-industries' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'admin@dangote.com' })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'partner-uuid' })
  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @ApiPropertyOptional({ enum: TenantPlan, default: TenantPlan.STARTER })
  @IsOptional()
  @IsEnum(TenantPlan)
  plan?: TenantPlan;

  @ApiPropertyOptional({ example: 'NG', default: 'NG' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string;

  @ApiPropertyOptional({ example: 'en-NG', default: 'en-NG' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;

  @ApiPropertyOptional({ example: 'Africa/Lagos', default: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ example: 'NGN', default: 'NGN' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: { primaryColor: '#FF6B35', logoUrl: 'https://...' } })
  @IsOptional()
  @IsObject()
  branding?: Record<string, any>;

  @ApiPropertyOptional({ example: 50, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  maxUsers?: number;

  @ApiPropertyOptional({ example: 5120, default: 1024 })
  @IsOptional()
  @IsInt()
  @Min(100)
  maxStorageMb?: number;
}
