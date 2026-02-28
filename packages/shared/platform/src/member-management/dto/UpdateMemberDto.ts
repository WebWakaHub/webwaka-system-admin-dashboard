import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsArray, Length, Matches, IsNumber } from 'class-validator';

/**
 * UpdateMemberDto
 * Data Transfer Object for updating an existing member.
 * Includes version for optimistic locking.
 */
export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  middleName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsEnum(['single', 'married', 'divorced', 'widowed'])
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';

  @IsOptional()
  @IsString()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be in format +234XXXXXXXXXX',
  })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  country?: string;

  @IsOptional()
  @IsEnum(['visitor', 'member', 'inactive', 'transferred', 'deceased'])
  status?: 'visitor' | 'member' | 'inactive' | 'transferred' | 'deceased';

  @IsOptional()
  @IsDateString()
  membershipDate?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  membershipType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsNumber()
  version!: number; // For optimistic locking
}
