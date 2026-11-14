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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('kitchen')
@Controller('kitchen')
export class KitchenController {
  constructor(
    private readonly kitchenService: KitchenService,
    private readonly ordersService: OrdersService,
    private readonly access: TenantAccessService,
  ) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Get active kitchen tickets for KDS' })
  @ApiQuery({ name: 'branchId', required: true, type: Number })
  @ApiQuery({ name: 'station', required: false, enum: StationType })
  async getTickets(
    @Query('branchId', ParseIntPipe) branchId: number,
    @CurrentUser() user: RequestUser,
    @Query('station') station?: StationType,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.kitchenService.getActiveKitchenTickets(branchId, station);
  }

  @Patch('items/:id/status')
  @ApiOperation({ summary: 'Update item preparation status (QUEUED, IN_PREPARATION, READY)' })
  async updateItemStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: KitchenItemStatus,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertOrderItem(user, id);
    return this.kitchenService.updateItemStatus(id, status);
  }

  @Get('orders/:id/thermal-ticket')
  @ApiOperation({ summary: 'Get ESC/POS formatted thermal print ticket text' })
  async getThermalTicket(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertOrder(user, id);
    const order = await this.ordersService.findOneOrder(id);
    const ticketText = this.kitchenService.generateThermalTicket(order);
    return {
      order_id: order.id,
      order_number: order.order_number,
      ticket_text: ticketText,
    };
  }
}
