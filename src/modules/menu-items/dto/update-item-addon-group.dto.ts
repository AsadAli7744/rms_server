import { PartialType } from '@nestjs/swagger';
import { CreateItemAddonGroupDto } from './create-item-addon-group.dto';

export class UpdateItemAddonGroupDto extends PartialType(CreateItemAddonGroupDto) {}
