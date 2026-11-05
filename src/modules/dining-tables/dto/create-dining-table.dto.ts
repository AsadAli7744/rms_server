import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { TableStatus } from '../../../common/enums';

export class CreateDiningTableDto {
  @ApiProperty()
  @IsString()
  @Length(1, 64)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floor?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  section?: string | null;

  @ApiPropertyOptional({ description: 'Structured floor (preferred over free-text floor)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  floor_id?: number | null;

  @ApiPropertyOptional({ description: 'Structured hall' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  hall_id?: number | null;

  @ApiPropertyOptional({ default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  seating_capacity?: number;

  @ApiPropertyOptional({ enum: TableStatus })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qr_code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort_order?: number | null;
}
