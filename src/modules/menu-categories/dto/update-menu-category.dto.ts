import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMenuCategoryDto } from './create-menu-category.dto';

export class UpdateMenuCategoryDto extends PartialType(
  OmitType(CreateMenuCategoryDto, ['restaurant_id'] as const),
) {}
