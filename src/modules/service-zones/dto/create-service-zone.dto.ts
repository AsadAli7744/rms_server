import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateServiceZoneDto {
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  zone_name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  zone_code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min_order_amount?: number | null;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  delivery_fee!: number;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  estimated_delivery_minutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  free_delivery_threshold?: number | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;
}
