import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../../common/shared/dto/pagination-query.dto';

export class QueryReservationDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date_from?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_archived?: boolean;
}
