import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @ApiPropertyOptional({ description: 'Operational customer id when known' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customer_id?: number | null;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  customer_name!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 32)
  customer_phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  customer_email?: string | null;

  @ApiProperty({ example: '2026-04-02' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  reservation_date!: string;

  @ApiProperty({ example: '19:30:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  reservation_time!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  guest_count!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  table_id?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_request?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;
}
