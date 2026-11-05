import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { RestaurantStatus } from '../../../common/enums';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Acme Foods' })
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiProperty({ example: 'acme-01' })
  @IsString()
  @Length(1, 64)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1024)
  logo_url?: string | null;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Length(2, 8)
  default_currency!: string;

  @ApiProperty({ example: 'Asia/Karachi' })
  @IsString()
  @Length(1, 64)
  timezone!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  support_dine_in?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  support_pickup?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  support_delivery?: boolean;

  @ApiPropertyOptional({ enum: RestaurantStatus })
  @IsOptional()
  @IsEnum(RestaurantStatus)
  status?: RestaurantStatus;
}
