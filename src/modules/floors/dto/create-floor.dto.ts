import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateFloorDto {
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  code?: string | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort_order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
