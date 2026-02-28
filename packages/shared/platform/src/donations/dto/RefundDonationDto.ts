import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class RefundDonationDto {
  @IsString()
  reason!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  amount?: number;
}
