import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { BranchStatus, TaxMode } from '../../../common/enums';

export class CreateBranchDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  restaurant_id!: number;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 64)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 32)
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  email?: string | null;

  @ApiProperty()
  @IsString()
  @Length(1, 512)
  address_line_1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address_line_2?: string | null;

  @ApiProperty()
  @IsString()
  @Length(1, 128)
  city!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  area?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiProperty()
  @IsString()
  @Length(1, 128)
  country!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postal_code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  online_ordering_enabled?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  pickup_enabled?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  delivery_enabled?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  dine_in_enabled?: boolean;

  @ApiPropertyOptional({ enum: BranchStatus })
  @IsOptional()
  @IsEnum(BranchStatus)
  branch_status?: BranchStatus;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  estimated_prep_time_minutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimum_order_amount?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  packing_charge?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  service_charge?: number | null;

  @ApiPropertyOptional({ enum: TaxMode })
  @IsOptional()
  @IsEnum(TaxMode)
  tax_mode?: TaxMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  default_tax_rate?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;
}
