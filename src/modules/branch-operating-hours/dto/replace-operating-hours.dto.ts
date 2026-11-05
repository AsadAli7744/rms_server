import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { OperatingHourRowDto } from './operating-hour-row.dto';

export class ReplaceOperatingHoursDto {
  @ApiProperty({ type: [OperatingHourRowDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OperatingHourRowDto)
  hours!: OperatingHourRowDto[];
}
