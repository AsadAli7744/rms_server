import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FulfillmentType, OrderSource } from '../../../common/enums';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  item_id!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  variant_id?: number | null;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  restaurant_id!: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  branch_id!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  table_id?: number | null;

  @ApiPropertyOptional({ enum: OrderSource, default: OrderSource.POS })
  @IsOptional()
  @IsEnum(OrderSource)
  source?: OrderSource;

  @ApiPropertyOptional({ enum: FulfillmentType, default: FulfillmentType.DINE_IN })
  @IsOptional()
  @IsEnum(FulfillmentType)
  fulfillment_type?: FulfillmentType;

  @ApiPropertyOptional({ description: 'Street address for Home Delivery orders' })
  @IsOptional()
  @IsString()
  delivery_address?: string | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  delivery_fee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customer_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customer_phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  waiter_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cashier_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  discount_type?: 'percentage' | 'fixed' | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount_value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discount_reason?: string | null;

  @ApiPropertyOptional({ default: false, description: 'True if cashier/manager is explicitly queuing order' })
  @IsOptional()
  @IsBoolean()
  is_queued?: boolean;

  @ApiPropertyOptional({ description: 'Role of the actor creating the order: cashier, manager, waiter, customer' })
  @IsOptional()
  @IsString()
  actor_role?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
