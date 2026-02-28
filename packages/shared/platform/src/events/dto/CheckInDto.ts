import { IsUUID, IsEnum, IsString, IsOptional } from 'class-validator';
import { CheckInMethod } from '../models/Attendance';

export class CheckInDto {
  @IsUUID()
  eventId!: string;

  @IsUUID()
  @IsOptional()
  memberId?: string;

  @IsString()
  @IsOptional()
  qrCode?: string;

  @IsEnum(CheckInMethod)
  checkInMethod!: CheckInMethod;

  @IsOptional()
  metadata?: Record<string, any>;
}
