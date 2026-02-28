import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { DonationFrequency, RecurringDonationStatus } from '../models/RecurringDonation';

export class UpdateRecurringDonationDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsEnum(DonationFrequency)
  @IsOptional()
  frequency?: DonationFrequency;

  @IsEnum(RecurringDonationStatus)
  @IsOptional()
  status?: RecurringDonationStatus;
}
