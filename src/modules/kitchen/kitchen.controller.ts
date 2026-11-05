import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { KitchenService } from './kitchen.service';
import { KitchenItemStatus, StationType } from '../../common/enums';
import { OrdersService } from '../orders/orders.service';

@ApiTags('kitchen')
@Controller('kitchen')
export class KitchenController {
  constructor(
    private readonly kitchenService: KitchenService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Get active kitchen tickets for KDS' })
  @ApiQuery({ name: 'branchId', required: true, type: Number })
  @ApiQuery({ name: 'station', required: false, enum: StationType })
  getTickets(
    @Query('branchId', ParseIntPipe) branchId: number,
    @Query('station') station?: StationType,
  ) {
    return this.kitchenService.getActiveKitchenTickets(branchId, station);
  }

  @Patch('items/:id/status')
  @ApiOperation({ summary: 'Update item preparation status (QUEUED, IN_PREPARATION, READY)' })
  updateItemStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: KitchenItemStatus,
  ) {
    return this.kitchenService.updateItemStatus(id, status);
  }

  @Get('orders/:id/thermal-ticket')
  @ApiOperation({ summary: 'Get ESC/POS formatted thermal print ticket text' })
  async getThermalTicket(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findOneOrder(id);
    const ticketText = this.kitchenService.generateThermalTicket(order);
    return {
      order_id: order.id,
      order_number: order.order_number,
      ticket_text: ticketText,
    };
  }
}
