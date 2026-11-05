import { PartialType } from '@nestjs/swagger';
import { CreateItemVariantDto } from './create-item-variant.dto';

export class UpdateItemVariantDto extends PartialType(CreateItemVariantDto) {}
