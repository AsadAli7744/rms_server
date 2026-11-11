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
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { TenantAuthGuard } from '../../common/guards/tenant-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('restaurants')
@Controller('restaurants')
@UseGuards(TenantAuthGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create / Onboard restaurant tenant (SaaS Platform Owner only)' })
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List restaurants (Admin sees all; Managers see only their own tenant)' })
  async findAll(@Query() query: QueryRestaurantDto, @CurrentUser() user: RequestUser) {
    if (user.role === UserRole.ADMIN) {
      return this.restaurantsService.findAll(query);
    }

    // Non-admin roles (manager, cashier, kitchen, waiter) are strictly isolated to their own restaurant
    const ownRestaurant = await this.restaurantsService.findOne(user.restaurant_id);
    return {
      data: [ownRestaurant],
      total: 1,
      page: 1,
      limit: query.limit ?? 20,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by id (Tenant isolated)' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    if (user.role !== UserRole.ADMIN && id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: You do not have permission to view other restaurant tenants.');
    }
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update restaurant' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: RequestUser,
  ) {
    if (user.role !== UserRole.ADMIN && id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: You do not have permission to modify other restaurant tenants.');
    }
    return this.restaurantsService.update(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft-archive restaurant (SaaS Platform Owner only)' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.archive(id);
  }
}
