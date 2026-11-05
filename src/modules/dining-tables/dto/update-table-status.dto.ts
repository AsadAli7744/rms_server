import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TableStatus } from '../../../common/enums';

export class UpdateTableStatusDto {
  @ApiProperty({ enum: TableStatus })
  @IsEnum(TableStatus)
  status!: TableStatus;
}
