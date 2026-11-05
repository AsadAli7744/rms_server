import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWebhookEndpointDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  restaurant_id!: number;

  @ApiPropertyOptional({
    description: 'When set, webhook receives only events for this branch',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  branch_id?: number | null;

  @ApiProperty()
  @IsString()
  @Length(1, 128)
  label!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  @Length(1, 2048)
  target_url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 256)
  secret?: string | null;

  @ApiProperty({ type: [String], example: ['order.placed'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  subscribed_events!: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
