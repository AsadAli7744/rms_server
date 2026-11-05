import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { KitchenItemStatus, OrderStatus, StationType } from '../../common/enums';
import { LiveEventsService } from '../live-events/live-events.service';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly liveEventsService: LiveEventsService,
  ) {}

  async getActiveKitchenTickets(branchId: number, station?: StationType) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.branch', 'branch')
      .where('order.branch_id = :branchId', { branchId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [
          OrderStatus.PLACED,
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.PARTIALLY_READY,
          OrderStatus.READY,
        ],
      })
      .andWhere('order.is_archived = false')
      .orderBy('order.created_at', 'ASC');

    const orders = await qb.getMany();

    // Filter items by station if specified
    return orders.map((order) => {
      const filteredItems = station
        ? order.items.filter((item) => item.station_type === station)
        : order.items;
      return {
        ...order,
        items: filteredItems,
        elapsed_minutes: Math.floor(
          (Date.now() - new Date(order.created_at).getTime()) / 60000,
        ),
      };
    });
  }

  async updateItemStatus(itemId: number, status: KitchenItemStatus) {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId, is_archived: false },
      relations: ['order'],
    });
    if (!item) {
      throw new NotFoundException(`Order item #${itemId} not found`);
    }

    item.status = status;
    await this.orderItemRepo.save(item);

    // Check sibling items to see if overall order status should progress
    const allItems = await this.orderItemRepo.find({
      where: { order_id: item.order_id, is_archived: false },
    });

    const order = await this.orderRepo.findOne({
      where: { id: item.order_id },
      relations: ['items', 'table', 'branch'],
    });

    if (order) {
      const allReady = allItems.every(
        (i) => i.status === KitchenItemStatus.READY || i.status === KitchenItemStatus.SERVED || i.status === KitchenItemStatus.CANCELLED,
      );
      const anyInPrep = allItems.some(
        (i) => i.status === KitchenItemStatus.IN_PREPARATION,
      );

      if (allReady && order.status !== OrderStatus.READY && order.status !== OrderStatus.SERVED) {
        order.status = OrderStatus.READY;
        await this.orderRepo.save(order);
      } else if (anyInPrep && order.status === OrderStatus.PLACED) {
        order.status = OrderStatus.PREPARING;
        await this.orderRepo.save(order);
      }

      this.liveEventsService.publish({
        type: 'order_status_changed',
        branch_id: order.branch_id,
        restaurant_id: order.restaurant_id,
        target_roles: ['kitchen', 'cashier'],
        data: order,
      });
    }

    return item;
  }

  generateThermalTicket(order: Order): string {
    const divider = '------------------------------------------\n';
    const dblDivider = '==========================================\n';
    let ticket = '';
    ticket += dblDivider;
    ticket += `       KITCHEN ORDER TICKET\n`;
    ticket += dblDivider;
    ticket += `Order #:   ${order.order_number}\n`;
    ticket += `Table:     ${order.table ? order.table.code : 'Takeaway / QR'}\n`;
    ticket += `Time:      ${new Date(order.created_at).toLocaleString()}\n`;
    if (order.waiter_name) {
      ticket += `Server:    ${order.waiter_name}\n`;
    }
    ticket += divider;
    ticket += `QTY  ITEM                           NOTES\n`;
    ticket += divider;

    for (const item of order.items || []) {
      const qtyStr = `${item.quantity}x`.padEnd(5);
      const name = (item.variant_name ? `${item.item_name} (${item.variant_name})` : item.item_name).padEnd(30);
      ticket += `${qtyStr}${name}\n`;
      if (item.notes) {
        ticket += `     >> Note: ${item.notes}\n`;
      }
    }

    if (order.notes) {
      ticket += divider;
      ticket += `SPECIAL INSTRUCTIONS:\n${order.notes}\n`;
    }

    ticket += dblDivider;
    ticket += `Auto-printed to Kitchen Thermal Printer\n\n\n\n`;
    return ticket;
  }
}
