import { IsString, IsEnum, IsDateString, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';
import { EventType, RecurringPattern } from '../models/Event';

export class CreateEventDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventType)
  eventType!: EventType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsBoolean()
  @IsOptional()
  registrationRequired?: boolean;

  @IsDateString()
  @IsOptional()
  registrationDeadline?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsEnum(RecurringPattern)
  @IsOptional()
  recurringPattern?: RecurringPattern;

  @IsOptional()
  metadata?: Record<string, any>;
}
