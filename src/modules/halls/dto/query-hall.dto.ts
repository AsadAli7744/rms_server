import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/shared/dto/pagination-query.dto';

export class QueryHallDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by floor' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  floor_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_archived?: boolean;
}
