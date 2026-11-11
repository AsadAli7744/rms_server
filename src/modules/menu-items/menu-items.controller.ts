import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';
import { CreateItemVariantDto } from './dto/create-item-variant.dto';
import { UpdateItemVariantDto } from './dto/update-item-variant.dto';
import { CreateItemAddonGroupDto } from './dto/create-item-addon-group.dto';
import { UpdateItemAddonGroupDto } from './dto/update-item-addon-group.dto';
import { CreateItemAddonOptionDto } from './dto/create-item-addon-option.dto';
import { UpdateItemAddonOptionDto } from './dto/update-item-addon-option.dto';
import { PurchaseStockDto } from './dto/purchase-stock.dto';
import { TenantAuthGuard } from '../../common/guards/tenant-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('menu-items')
@Controller('menu-items')
@UseGuards(TenantAuthGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create menu item' })
  create(@Body() dto: CreateMenuItemDto, @CurrentUser() user: RequestUser) {
    if (user && user.role !== UserRole.ADMIN) {
      dto.restaurant_id = user.restaurant_id;
    }
    return this.menuItemsService.createItem(dto);
  }

  @Post('stock/purchase')
  @ApiOperation({ summary: 'Record inventory stock purchase / replenishment for a menu item' })
  purchaseStock(@Body() dto: PurchaseStockDto) {
    return this.menuItemsService.purchaseStock(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List menu items (Tenant isolated)' })
  findAll(@Query() query: QueryMenuItemDto, @CurrentUser() user: RequestUser) {
    if (user && user.role !== UserRole.ADMIN) {
      query.restaurant_id = user.restaurant_id;
    }
    return this.menuItemsService.findAllItems(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.findOneItem(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update menu item' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.updateItem(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive menu item' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.archiveItem(id);
  }
}

@ApiTags('menu-items')
@Controller('menu-items/:itemId/variants')
export class MenuItemVariantsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List variants for item' })
  list(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.menuItemsService.listVariants(itemId);
  }

  @Post()
  @ApiOperation({ summary: 'Create variant' })
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateItemVariantDto,
  ) {
    return this.menuItemsService.createVariant(itemId, dto);
  }
}

@ApiTags('menu-items')
@Controller('item-variants')
export class ItemVariantsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update variant' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemVariantDto,
  ) {
    return this.menuItemsService.updateVariant(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive variant' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.archiveVariant(id);
  }
}

@ApiTags('menu-items')
@Controller('menu-items/:itemId/addon-groups')
export class MenuItemAddonGroupsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List add-on groups for item' })
  list(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.menuItemsService.listAddonGroups(itemId);
  }

  @Post()
  @ApiOperation({ summary: 'Create add-on group' })
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateItemAddonGroupDto,
  ) {
    return this.menuItemsService.createAddonGroup(itemId, dto);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-groups')
export class ItemAddonGroupsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update add-on group' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemAddonGroupDto,
  ) {
    return this.menuItemsService.updateAddonGroup(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive add-on group' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.archiveAddonGroup(id);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-groups/:groupId/options')
export class ItemAddonOptionsNestedController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List options in add-on group' })
  list(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.menuItemsService.listAddonOptions(groupId);
  }

  @Post()
  @ApiOperation({ summary: 'Create add-on option' })
  create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateItemAddonOptionDto,
  ) {
    return this.menuItemsService.createAddonOption(groupId, dto);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-options')
export class ItemAddonOptionsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update add-on option' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemAddonOptionDto,
  ) {
    return this.menuItemsService.updateAddonOption(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive add-on option' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.archiveAddonOption(id);
  }
}
