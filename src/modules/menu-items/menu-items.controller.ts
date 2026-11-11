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
  ForbiddenException,
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
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('menu-items')
@Controller('menu-items')
@UseGuards(TenantAuthGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create menu item (Admin & Manager only)' })
  create(@Body() dto: CreateMenuItemDto, @CurrentUser() user: RequestUser) {
    if (user && user.role !== UserRole.ADMIN) {
      dto.restaurant_id = user.restaurant_id;
    }
    return this.menuItemsService.createItem(dto, user?.id);
  }

  @Post('stock/purchase')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Record inventory stock replenishment for a menu item (Admin & Manager only)' })
  async purchaseStock(@Body() dto: PurchaseStockDto, @CurrentUser() user: RequestUser) {
    const item = await this.menuItemsService.findOneItem(dto.item_id);
    if (user && user.role !== UserRole.ADMIN && item.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: Cannot replenish stock for items belonging to other restaurants.');
    }
    return this.menuItemsService.purchaseStock(dto, user?.id);
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update menu item (Admin & Manager only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: RequestUser,
  ) {
    const item = await this.menuItemsService.findOneItem(id);
    if (user && user.role !== UserRole.ADMIN && item.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: Cannot modify items belonging to other restaurants.');
    }
    return this.menuItemsService.updateItem(id, dto, user?.id);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive menu item (Admin & Manager only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    const item = await this.menuItemsService.findOneItem(id);
    if (user && user.role !== UserRole.ADMIN && item.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: Cannot archive items belonging to other restaurants.');
    }
    return this.menuItemsService.archiveItem(id, user?.id);
  }
}

@ApiTags('menu-items')
@Controller('menu-items/:itemId/variants')
@UseGuards(TenantAuthGuard)
export class MenuItemVariantsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List variants for item' })
  list(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.menuItemsService.listVariants(itemId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create variant (Admin & Manager only)' })
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateItemVariantDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.menuItemsService.createVariant(itemId, dto, user?.id);
  }
}

@ApiTags('menu-items')
@Controller('item-variants')
@UseGuards(TenantAuthGuard)
export class ItemVariantsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update variant (Admin & Manager only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemVariantDto,
  ) {
    return this.menuItemsService.updateVariant(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive variant (Admin & Manager only)' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.archiveVariant(id);
  }
}

@ApiTags('menu-items')
@Controller('menu-items/:itemId/addon-groups')
@UseGuards(TenantAuthGuard)
export class MenuItemAddonGroupsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List add-on groups for item' })
  list(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.menuItemsService.listAddonGroups(itemId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create add-on group (Admin & Manager only)' })
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateItemAddonGroupDto,
  ) {
    return this.menuItemsService.createAddonGroup(itemId, dto);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-groups')
@UseGuards(TenantAuthGuard)
export class ItemAddonGroupsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update add-on group (Admin & Manager only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemAddonGroupDto,
  ) {
    return this.menuItemsService.updateAddonGroup(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive add-on group (Admin & Manager only)' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.archiveAddonGroup(id);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-groups/:groupId/options')
@UseGuards(TenantAuthGuard)
export class ItemAddonOptionsNestedController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List options in add-on group' })
  list(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.menuItemsService.listAddonOptions(groupId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create add-on option (Admin & Manager only)' })
  create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateItemAddonOptionDto,
  ) {
    return this.menuItemsService.createAddonOption(groupId, dto);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-options')
@UseGuards(TenantAuthGuard)
export class ItemAddonOptionsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update add-on option (Admin & Manager only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemAddonOptionDto,
  ) {
    return this.menuItemsService.updateAddonOption(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive add-on option (Admin & Manager only)' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.archiveAddonOption(id);
  }
}
