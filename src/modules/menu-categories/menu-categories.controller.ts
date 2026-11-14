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
import { MenuCategoriesService } from './menu-categories.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { QueryMenuCategoryDto } from './dto/query-menu-category.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('menu-categories')
@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(
    private readonly menuCategoriesService: MenuCategoriesService,
    private readonly access: TenantAccessService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create menu category (Admin & Manager only)' })
  create(@Body() dto: CreateMenuCategoryDto, @CurrentUser() user: RequestUser) {
    if (!this.access.isAdmin(user)) {
      dto.restaurant_id = user.restaurant_id;
    }
    this.access.ensureRestaurant(user, dto.restaurant_id);
    return this.menuCategoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List menu categories (Tenant isolated)' })
  findAll(@Query() query: QueryMenuCategoryDto, @CurrentUser() user: RequestUser) {
    query.restaurant_id = this.access.scopeRestaurant(user, query.restaurant_id);
    return this.menuCategoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu category' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertMenuCategory(user, id);
    return this.menuCategoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update menu category (Admin & Manager only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertMenuCategory(user, id);
    return this.menuCategoriesService.update(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive menu category (Admin & Manager only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertMenuCategory(user, id);
    return this.menuCategoriesService.archive(id);
  }
}
