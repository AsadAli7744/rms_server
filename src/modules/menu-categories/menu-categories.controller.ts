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
import { MenuCategoriesService } from './menu-categories.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { QueryMenuCategoryDto } from './dto/query-menu-category.dto';
import { TenantAuthGuard } from '../../common/guards/tenant-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('menu-categories')
@Controller('menu-categories')
@UseGuards(TenantAuthGuard)
export class MenuCategoriesController {
  constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create menu category (Admin & Manager only)' })
  create(@Body() dto: CreateMenuCategoryDto, @CurrentUser() user: RequestUser) {
    if (user && user.role !== UserRole.ADMIN) {
      dto.restaurant_id = user.restaurant_id;
    }
    return this.menuCategoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List menu categories (Tenant isolated)' })
  findAll(@Query() query: QueryMenuCategoryDto, @CurrentUser() user: RequestUser) {
    if (user && user.role !== UserRole.ADMIN) {
      query.restaurant_id = user.restaurant_id;
    }
    return this.menuCategoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu category' })
  findOne(@Param('id', ParseIntPipe) id: number) {
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
    const cat = await this.menuCategoriesService.findOne(id);
    if (user && user.role !== UserRole.ADMIN && cat.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: Cannot modify categories of other restaurants.');
    }
    return this.menuCategoriesService.update(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Archive menu category (Admin & Manager only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    const cat = await this.menuCategoriesService.findOne(id);
    if (user && user.role !== UserRole.ADMIN && cat.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: Cannot archive categories of other restaurants.');
    }
    return this.menuCategoriesService.archive(id);
  }
}
