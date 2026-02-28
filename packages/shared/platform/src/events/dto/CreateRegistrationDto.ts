import { IsUUID, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { TicketType } from '../models/Registration';

export class CreateRegistrationDto {
  @IsUUID()
  eventId!: string;

  @IsUUID()
  memberId!: string;

  @IsEnum(TicketType)
  @IsOptional()
  ticketType?: TicketType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  paymentAmount?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
