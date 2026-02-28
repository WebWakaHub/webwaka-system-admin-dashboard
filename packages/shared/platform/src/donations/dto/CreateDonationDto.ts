import { IsUUID, IsNumber, IsString, IsEnum, IsOptional, Min, Length } from 'class-validator';
import { PaymentMethod } from '../models/Donation';

export class CreateDonationDto {
  @IsUUID()
  donorId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsString()
  @Length(3, 3)
  currency: string = 'NGN';

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
