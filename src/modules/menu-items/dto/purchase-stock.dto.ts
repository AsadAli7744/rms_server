import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PurchaseStockDto {
  @ApiProperty({ description: 'ID of the menu item being restocked' })
  @IsInt()
  @Type(() => Number)
  item_id!: number;

  @ApiProperty({ description: 'Quantity of stock to add', default: 50 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Unit cost per item purchased' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unit_cost?: number;

  @ApiPropertyOptional({ description: 'Supplier name or invoice number' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Notes or comments about this purchase' })
  @IsOptional()
  @IsString()
  notes?: string;
}
