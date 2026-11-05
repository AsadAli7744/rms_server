import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/shared/dto/pagination-query.dto';
import { RestaurantStatus } from '../../../common/enums';

export class QueryRestaurantDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RestaurantStatus })
  @IsOptional()
  @IsEnum(RestaurantStatus)
  status?: RestaurantStatus;

  @ApiPropertyOptional({ description: 'Search by name or code (partial)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Include archived rows' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_archived?: boolean;
}
