import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../../common/enums';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  paid_amount?: number;
}

export class ApplyDiscountDto {
  @ApiProperty({ enum: ['percentage', 'fixed'] })
  @IsIn(['percentage', 'fixed'])
  discount_type!: 'percentage' | 'fixed';

  @ApiProperty({ description: 'Percentage value (e.g. 10 for 10%) or fixed currency amount' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount_value!: number;

  @ApiPropertyOptional({ description: 'Reason for the discount (e.g. Loyalty, Senior Citizen, Promotion)' })
  @IsOptional()
  @IsString()
  discount_reason?: string | null;
}

export class CancelOrderDto {
  @ApiPropertyOptional({ description: 'Reason for order cancellation', default: 'Cancelled by cashier' })
  @IsOptional()
  @IsString()
  reason?: string;
}
