import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, Length } from 'class-validator';

export class UpsertBranchSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 16)
  order_number_prefix?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receipt_footer?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  notification_email?: string | null;

  @ApiPropertyOptional({ description: 'Extensible structured settings' })
  @IsOptional()
  @IsObject()
  settings_json?: Record<string, unknown> | null;
}
