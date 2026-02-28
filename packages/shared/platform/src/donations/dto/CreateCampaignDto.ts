import { IsString, IsNumber, IsDateString, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  goalAmount!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
