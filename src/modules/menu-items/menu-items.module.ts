import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { ItemVariant } from './entities/item-variant.entity';
import { ItemAddonGroup } from './entities/item-addon-group.entity';
import { ItemAddonOption } from './entities/item-addon-option.entity';
import { MenuCategory } from '../menu-categories/entities/menu-category.entity';
import { MenuItemsService } from './menu-items.service';
import {
  MenuItemsController,
  MenuItemVariantsController,
  ItemVariantsController,
  MenuItemAddonGroupsController,
  ItemAddonGroupsController,
  ItemAddonOptionsNestedController,
  ItemAddonOptionsController,
} from './menu-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuItem,
      ItemVariant,
      ItemAddonGroup,
      ItemAddonOption,
      MenuCategory,
    ]),
  ],
  controllers: [
    MenuItemsController,
    MenuItemVariantsController,
    ItemVariantsController,
    MenuItemAddonGroupsController,
    ItemAddonGroupsController,
    ItemAddonOptionsNestedController,
    ItemAddonOptionsController,
  ],
  providers: [MenuItemsService],
  exports: [MenuItemsService, TypeOrmModule],
})
export class MenuItemsModule {}
