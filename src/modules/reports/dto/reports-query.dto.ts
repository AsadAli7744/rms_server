import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class ItemSalesQueryDto {
  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  branch_id!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  restaurant_id?: number;

  @ApiPropertyOptional({ description: 'Comma separated list of item IDs, e.g. 1,2,5' })
  @IsOptional()
  @IsString()
  item_ids?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly', 'total'], default: 'daily' })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'total'])
  period?: 'daily' | 'weekly' | 'monthly' | 'total';
}

export class SalesSummaryQueryDto {
  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  branch_id!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  restaurant_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
