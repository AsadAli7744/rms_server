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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { ApplyDiscountDto, CancelOrderDto, UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly access: TenantAccessService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create order (QR scan, Waiter POS, or Cashier) with active queue validation' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: RequestUser) {
    return this.ordersService.createOrder(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List orders with filtering' })
  async findAll(@Query() query: QueryOrderDto, @CurrentUser() user: RequestUser) {
    query.restaurant_id = this.access.scopeRestaurant(user, query.restaurant_id);
    query.branch_id = await this.access.resolveBranchFilter(user, query.branch_id);
    if (query.table_id != null) await this.access.assertTable(user, query.table_id);
    return this.ordersService.findAllOrders(query);
  }

  @Public()
  @Get('table/:tableId/active')
  @ApiOperation({ summary: 'Get current active order and queued orders for a table' })
  getTableActiveOrder(
    @Param('tableId', ParseIntPipe) tableId: number,
    @Query('branchId', ParseIntPipe) branchId: number,
  ) {
    return this.ordersService.getActiveOrderByTable(tableId, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details with items and table' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertOrder(user, id);
    return this.ordersService.findOneOrder(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status & payment' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertOrder(user, id);
    return this.ordersService.updateOrderStatus(id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel order, restore stock, and release dining table' })
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertOrder(user, id);
    return this.ordersService.cancelOrder(id, dto.reason);
  }

  @Patch(':id/discount')
  @ApiOperation({ summary: 'Apply discount to order' })
  async applyDiscount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyDiscountDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertOrder(user, id);
    return this.ordersService.applyDiscount(id, dto);
  }

  @Post(':id/print')
  @ApiOperation({ summary: 'Record thermal print of kitchen order ticket' })
  async markPrinted(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertOrder(user, id);
    return this.ordersService.markPrinted(id);
  }
}
