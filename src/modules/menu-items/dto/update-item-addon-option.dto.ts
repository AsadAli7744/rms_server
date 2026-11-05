import { PartialType } from '@nestjs/swagger';
import { CreateItemAddonOptionDto } from './create-item-addon-option.dto';

export class UpdateItemAddonOptionDto extends PartialType(CreateItemAddonOptionDto) {}
