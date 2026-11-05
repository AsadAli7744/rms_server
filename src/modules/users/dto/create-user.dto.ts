import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRole } from '../../../common/enums';

export class CreateUserDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  restaurant_id!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  branch_id?: number | null;

  @ApiProperty()
  @IsString()
  @Length(2, 255)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CASHIER })
  @IsEnum(UserRole)
  role!: UserRole;
}
