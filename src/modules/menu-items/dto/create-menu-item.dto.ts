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
import {
  AvailabilityType,
  MenuItemType,
  StationType,
} from '../../../common/enums';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  restaurant_id!: number;

  @ApiPropertyOptional({
    description:
      'Menu category. Optional — when omitted, the item is filed under General.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  category_id?: number;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiPropertyOptional({
    description: 'URL key. Generated from the item name when omitted.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  short_description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  full_description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1024)
  image_url?: string | null;

  @ApiPropertyOptional({ enum: MenuItemType })
  @IsOptional()
  @IsEnum(MenuItemType)
  item_type?: MenuItemType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  base_price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  sku?: string | null;

  @ApiPropertyOptional({ enum: StationType })
  @IsOptional()
  @IsEnum(StationType)
  preparation_station_type?: StationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_spicy?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_veg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_halal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    default: true,
    description:
      'Whether to track inventory stock. Set false for regular items (e.g. tea, rice, bread) that impact sales & bill but do not decrement stock.',
  })
  @IsOptional()
  @IsBoolean()
  track_stock?: boolean;

  @ApiPropertyOptional({ default: 50, description: 'Initial stock quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock_quantity?: number;

  @ApiPropertyOptional({ default: 10, description: 'Low stock warning threshold' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  low_stock_threshold?: number;

  @ApiPropertyOptional({ enum: AvailabilityType })
  @IsOptional()
  @IsEnum(AvailabilityType)
  availability_type?: AvailabilityType;
}
