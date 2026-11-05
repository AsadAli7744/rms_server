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
import { ApplyDiscountDto, UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order (QR scan, Waiter POS, or Cashier) with active queue validation' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders with filtering' })
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAllOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details with items and table' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOneOrder(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status & payment' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto);
  }

  @Patch(':id/discount')
  @ApiOperation({ summary: 'Apply discount to order' })
  applyDiscount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyDiscountDto,
  ) {
    return this.ordersService.applyDiscount(id, dto);
  }

  @Post(':id/print')
  @ApiOperation({ summary: 'Record thermal print of kitchen order ticket' })
  markPrinted(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.markPrinted(id);
  }

  @Get('table/:tableId/active')
  @ApiOperation({ summary: 'Get current active order and queued orders for a table' })
  getTableActiveOrder(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.ordersService.getActiveOrderByTable(tableId);
  }
}
