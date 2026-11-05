import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { AvailabilityType } from '../../../common/enums';

export class CreateMenuCategoryDto {
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
  @Length(1, 255)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1024)
  image_url?: string | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sort_order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ enum: AvailabilityType })
  @IsOptional()
  @IsEnum(AvailabilityType)
  availability_type?: AvailabilityType;
}
