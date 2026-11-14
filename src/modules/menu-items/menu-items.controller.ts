import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly access: TenantAccessService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create menu item (Admin & Manager only)' })
  async create(@Body() dto: CreateMenuItemDto, @CurrentUser() user: RequestUser) {
    if (!this.access.isAdmin(user)) {
      dto.restaurant_id = user.restaurant_id;
    }
    this.access.ensureRestaurant(user, dto.restaurant_id);
    if (dto.category_id) await this.access.assertMenuCategory(user, dto.category_id);
    return this.menuItemsService.createItem(dto, user?.id);
  }

  @Post('stock/purchase')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Record inventory stock replenishment for a menu item (Admin & Manager only)' })
  async purchaseStock(@Body() dto: PurchaseStockDto, @CurrentUser() user: RequestUser) {
    await this.access.assertMenuItem(user, dto.item_id);
    return this.menuItemsService.purchaseStock(dto, user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'List menu items (Tenant isolated)' })
  findAll(@Query() query: QueryMenuItemDto, @CurrentUser() user: RequestUser) {
    query.restaurant_id = this.access.scopeRestaurant(user, query.restaurant_id);
    return this.menuItemsService.findAllItems(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertMenuItem(user, id);
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
    await this.access.assertMenuItem(user, id);
    if (dto.category_id) await this.access.assertMenuCategory(user, dto.category_id);
    return this.menuItemsService.updateItem(id, dto, user?.id);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive menu item (Admin & Manager only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertMenuItem(user, id);
    return this.menuItemsService.archiveItem(id, user?.id);
  }
}

@ApiTags('menu-items')
@Controller('menu-items/:itemId/variants')
export class MenuItemVariantsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List variants for item' })
  async list(@Param('itemId', ParseIntPipe) itemId: number, @CurrentUser() user: RequestUser) {
    await this.access.assertMenuItem(user, itemId);
    return this.menuItemsService.listVariants(itemId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create variant (Admin & Manager only)' })
  async create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateItemVariantDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertMenuItem(user, itemId);
    return this.menuItemsService.createVariant(itemId, dto, user?.id);
  }
}

@ApiTags('menu-items')
@Controller('item-variants')
export class ItemVariantsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly access: TenantAccessService,
  ) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update variant (Admin & Manager only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemVariantDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertVariant(user, id);
    return this.menuItemsService.updateVariant(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive variant (Admin & Manager only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertVariant(user, id);
    return this.menuItemsService.archiveVariant(id);
  }
}

@ApiTags('menu-items')
@Controller('menu-items/:itemId/addon-groups')
export class MenuItemAddonGroupsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List add-on groups for item' })
  async list(@Param('itemId', ParseIntPipe) itemId: number, @CurrentUser() user: RequestUser) {
    await this.access.assertMenuItem(user, itemId);
    return this.menuItemsService.listAddonGroups(itemId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create add-on group (Admin & Manager only)' })
  async create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateItemAddonGroupDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertMenuItem(user, itemId);
    return this.menuItemsService.createAddonGroup(itemId, dto);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-groups')
export class ItemAddonGroupsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly access: TenantAccessService,
  ) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update add-on group (Admin & Manager only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemAddonGroupDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertAddonGroup(user, id);
    return this.menuItemsService.updateAddonGroup(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive add-on group (Admin & Manager only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertAddonGroup(user, id);
    return this.menuItemsService.archiveAddonGroup(id);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-groups/:groupId/options')
export class ItemAddonOptionsNestedController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List options in add-on group' })
  async list(@Param('groupId', ParseIntPipe) groupId: number, @CurrentUser() user: RequestUser) {
    await this.access.assertAddonGroup(user, groupId);
    return this.menuItemsService.listAddonOptions(groupId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create add-on option (Admin & Manager only)' })
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateItemAddonOptionDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertAddonGroup(user, groupId);
    return this.menuItemsService.createAddonOption(groupId, dto);
  }
}

@ApiTags('menu-items')
@Controller('item-addon-options')
export class ItemAddonOptionsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly access: TenantAccessService,
  ) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update add-on option (Admin & Manager only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemAddonOptionDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertAddonOption(user, id);
    return this.menuItemsService.updateAddonOption(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive add-on option (Admin & Manager only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertAddonOption(user, id);
    return this.menuItemsService.archiveAddonOption(id);
  }
}
