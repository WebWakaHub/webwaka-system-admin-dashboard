import { IsUUID, IsNumber, IsString, IsEnum, IsOptional, IsDateString, Min, Length } from 'class-validator';
import { DonationFrequency } from '../models/RecurringDonation';

export class CreateRecurringDonationDto {
  @IsUUID()
  donorId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsString()
  @Length(3, 3)
  currency: string = 'NGN';

  @IsEnum(DonationFrequency)
  frequency!: DonationFrequency;

  @IsString()
  paymentMethod!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
