import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { DayOfWeek } from '../../../common/enums';

export class OperatingHourRowDto {
  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  @Type(() => Number)
  day_of_week!: DayOfWeek;

  @ApiPropertyOptional({ example: '09:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  open_time?: string | null;

  @ApiPropertyOptional({ example: '22:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  close_time?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_closed?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  supports_pickup?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  supports_delivery?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  supports_dine_in?: boolean;
}
