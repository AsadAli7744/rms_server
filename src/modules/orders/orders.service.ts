import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, ApplyDiscountDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Branch } from '../branches/entities/branch.entity';
import { DiningTable } from '../dining-tables/entities/dining-table.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { ItemVariant } from '../menu-items/entities/item-variant.entity';
import { LiveEventsService } from '../live-events/live-events.service';
import { WebhookDispatchService } from '../webhooks/webhook-dispatch.service';
import {
  KitchenItemStatus,
  OrderSource,
  OrderStatus,
  PaymentStatus,
  TableStatus,
  WebhookEventType,
} from '../../common/enums';
import { buildPaginatedResponse } from '../../common/shared/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(DiningTable)
    private readonly tableRepo: Repository<DiningTable>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    @InjectRepository(ItemVariant)
    private readonly variantRepo: Repository<ItemVariant>,
    private readonly liveEventsService: LiveEventsService,
    private readonly webhookDispatch: WebhookDispatchService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: dto.restaurant_id, is_archived: false },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${dto.restaurant_id} not found`);
    }

    const branch = await this.branchRepo.findOne({
      where: { id: dto.branch_id, is_archived: false },
    });
    if (!branch || branch.restaurant_id !== dto.restaurant_id) {
      throw new BadRequestException(
        `Branch #${dto.branch_id} does not belong to restaurant #${dto.restaurant_id}`,
      );
    }

    let table: DiningTable | null = null;
    if (dto.table_id != null) {
      table = await this.tableRepo.findOne({
        where: { id: dto.table_id, branch_id: dto.branch_id, is_archived: false },
      });
      if (!table) {
        throw new NotFoundException(
          `Dining table #${dto.table_id} not found in branch #${dto.branch_id}`,
        );
      }

      // Check for an existing active order on this table
      const activeOrder = await this.orderRepo.findOne({
        where: {
          table_id: dto.table_id,
          status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.VOIDED])),
          is_archived: false,
        },
        order: { id: 'DESC' },
      });

      // Constraint: Basically one system can have one active order, and only cashier/manager can add the next order in queue, not the customer by just scanning.
      const isCustomerScan =
        (dto.source as string) === 'web' ||
        dto.actor_role === 'customer' ||
        (!dto.actor_role && (dto.source as string) === 'web');

      if (activeOrder && isCustomerScan) {
        throw new ConflictException(
          `Table "${table.code}" already has an active order (#${activeOrder.order_number}). Only the cashier or manager can add the next order in the queue, not the customer by scanning.`,
        );
      }
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Generate Order Number
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${datePrefix}-${randPart}`;

    // Calculate queue number if queued
    let queueNumber: number | null = null;
    let isQueued = Boolean(dto.is_queued);
    if (isQueued) {
      const queuedCount = await this.orderRepo.count({
        where: {
          branch_id: dto.branch_id,
          is_queued: true,
          status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED])),
          is_archived: false,
        },
      });
      queueNumber = queuedCount + 1;
    }

    // Resolve order items & calculate subtotal
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const itemDto of dto.items) {
      const menuItem = await this.menuItemRepo.findOne({
        where: { id: itemDto.item_id, restaurant_id: dto.restaurant_id, is_archived: false },
      });
      if (!menuItem) {
        throw new NotFoundException(`Menu item #${itemDto.item_id} not found`);
      }

      let unitPrice = Number(menuItem.base_price);
      let variantName: string | null = null;

      if (itemDto.variant_id) {
        const variant = await this.variantRepo.findOne({
          where: { id: itemDto.variant_id, item_id: menuItem.id, is_archived: false },
        });
        if (variant) {
          unitPrice =
            variant.override_price != null
              ? Number(variant.override_price)
              : unitPrice + Number(variant.price_adjustment ?? 0);
          variantName = variant.name;
        }
      }

      const itemSubtotal = unitPrice * itemDto.quantity;
      subtotal += itemSubtotal;

      const orderItem = this.orderItemRepo.create({
        item_id: menuItem.id,
        item_name: menuItem.name,
        variant_id: itemDto.variant_id ?? null,
        variant_name: variantName,
        unit_price: unitPrice,
        quantity: itemDto.quantity,
        subtotal: itemSubtotal,
        station_type: menuItem.preparation_station_type,
        status: KitchenItemStatus.QUEUED,
        notes: itemDto.notes ?? null,
      });

      orderItems.push(orderItem);
    }

    // Calculate discounts
    let discountAmount = 0;
    const discountVal = dto.discount_value ? Number(dto.discount_value) : 0;
    if (dto.discount_type === 'percentage') {
      discountAmount = Math.round(((subtotal * discountVal) / 100) * 100) / 100;
    } else if (dto.discount_type === 'fixed') {
      discountAmount = Math.min(discountVal, subtotal);
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    // Taxes & service charges (5% sample standard tax)
    const taxAmount = Math.round(discountedSubtotal * 0.05 * 100) / 100;
    const totalAmount = Math.round((discountedSubtotal + taxAmount) * 100) / 100;

    const order = this.orderRepo.create({
      restaurant_id: dto.restaurant_id,
      branch_id: dto.branch_id,
      table_id: dto.table_id ?? null,
      order_number: orderNumber,
      source: dto.source ?? OrderSource.POS,
      status: OrderStatus.PLACED,
      subtotal: Math.round(subtotal * 100) / 100,
      discount_type: dto.discount_type ?? null,
      discount_value: discountVal,
      discount_amount: discountAmount,
      discount_reason: dto.discount_reason ?? null,
      tax_amount: taxAmount,
      service_charge: 0,
      total_amount: totalAmount,
      paid_amount: 0,
      payment_status: PaymentStatus.PENDING,
      customer_name: dto.customer_name ?? null,
      customer_phone: dto.customer_phone ?? null,
      waiter_name: dto.waiter_name ?? null,
      cashier_name: dto.cashier_name ?? null,
      is_queued: isQueued,
      queue_number: queueNumber,
      notes: dto.notes ?? null,
      items: orderItems,
    });

    const savedOrder = await this.orderRepo.save(order);

    // If dining table was assigned, mark table as occupied
    if (table) {
      await this.tableRepo.update(table.id, { status: TableStatus.OCCUPIED });
    }

    // Load full relations for event emission
    const fullOrder = await this.findOneOrder(savedOrder.id);

    // AUTOMATIC NOTIFICATION: Dispatch to Kitchen and Cashier screens via LiveEventsService
    this.liveEventsService.publish({
      type: 'order_created',
      branch_id: fullOrder.branch_id,
      restaurant_id: fullOrder.restaurant_id,
      target_roles: ['kitchen', 'cashier', 'manager'],
      data: fullOrder,
    });

    // Outbound Webhook dispatch
    try {
      await this.webhookDispatch.dispatch(
        fullOrder.restaurant_id,
        WebhookEventType.ORDER_PLACED,
        {
          order_id: fullOrder.id,
          order_number: fullOrder.order_number,
          branch_id: fullOrder.branch_id,
          table_id: fullOrder.table_id,
          total_amount: fullOrder.total_amount,
          items_count: fullOrder.items.length,
          source: fullOrder.source,
        },
        fullOrder.branch_id,
      );
    } catch {
      // Don't fail the order if webhooks are not configured
    }

    return fullOrder;
  }

  async findAllOrders(query: QueryOrderDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.branch', 'branch')
      .where('order.is_archived = :isArchived', { isArchived: false });

    if (query.restaurant_id != null) {
      qb.andWhere('order.restaurant_id = :restaurantId', {
        restaurantId: query.restaurant_id,
      });
    }

    if (query.branch_id != null) {
      qb.andWhere('order.branch_id = :branchId', { branchId: query.branch_id });
    }

    if (query.table_id != null) {
      qb.andWhere('order.table_id = :tableId', { tableId: query.table_id });
    }

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.source) {
      qb.andWhere('order.source = :source', { source: query.source });
    }

    if (query.payment_status) {
      qb.andWhere('order.payment_status = :paymentStatus', {
        paymentStatus: query.payment_status,
      });
    }

    if (query.is_queued != null) {
      qb.andWhere('order.is_queued = :isQueued', { isQueued: query.is_queued });
    }

    if (query.start_date) {
      qb.andWhere('order.created_at >= :startDate', {
        startDate: new Date(query.start_date),
      });
    }

    if (query.end_date) {
      qb.andWhere('order.created_at <= :endDate', {
        endDate: new Date(query.end_date),
      });
    }

    if (query.search) {
      qb.andWhere(
        '(order.order_number ILIKE :s OR order.customer_name ILIKE :s OR order.customer_phone ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('order.id', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOneOrder(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, is_archived: false },
      relations: ['items', 'table', 'branch', 'restaurant'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOneOrder(id);

    order.status = dto.status;
    if (dto.payment_status) {
      order.payment_status = dto.payment_status;
    }
    if (dto.payment_method) {
      order.payment_method = dto.payment_method;
    }
    if (dto.paid_amount != null) {
      order.paid_amount = Number(dto.paid_amount);
      if (order.paid_amount >= order.total_amount) {
        order.payment_status = PaymentStatus.PAID;
      }
    }

    // If order is completed or cancelled, check table status
    if (
      (dto.status === OrderStatus.COMPLETED ||
        dto.status === OrderStatus.CANCELLED ||
        dto.status === OrderStatus.VOIDED) &&
      order.table_id != null
    ) {
      const remainingActive = await this.orderRepo.count({
        where: {
          table_id: order.table_id,
          id: Not(order.id),
          status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.VOIDED])),
          is_archived: false,
        },
      });
      if (remainingActive === 0) {
        await this.tableRepo.update(order.table_id, {
          status: TableStatus.AVAILABLE,
        });
      }
    }

    const updated = await this.orderRepo.save(order);
    const fullOrder = await this.findOneOrder(updated.id);

    // Notify Kitchen & Cashier of status update
    this.liveEventsService.publish({
      type: 'order_status_changed',
      branch_id: fullOrder.branch_id,
      restaurant_id: fullOrder.restaurant_id,
      target_roles: ['kitchen', 'cashier', 'manager'],
      data: fullOrder,
    });

    try {
      await this.webhookDispatch.dispatch(
        fullOrder.restaurant_id,
        WebhookEventType.ORDER_STATUS_CHANGED,
        {
          order_id: fullOrder.id,
          order_number: fullOrder.order_number,
          new_status: fullOrder.status,
          payment_status: fullOrder.payment_status,
        },
        fullOrder.branch_id,
      );
    } catch {
      // ignore webhook delivery failure
    }

    return fullOrder;
  }

  async applyDiscount(id: number, dto: ApplyDiscountDto): Promise<Order> {
    const order = await this.findOneOrder(id);

    order.discount_type = dto.discount_type;
    order.discount_value = Number(dto.discount_value);
    order.discount_reason = dto.discount_reason ?? null;

    let discountAmount = 0;
    if (dto.discount_type === 'percentage') {
      discountAmount = Math.round(((order.subtotal * order.discount_value) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(order.discount_value, order.subtotal);
    }

    order.discount_amount = discountAmount;
    const discountedSubtotal = Math.max(0, order.subtotal - discountAmount);
    order.tax_amount = Math.round(discountedSubtotal * 0.05 * 100) / 100;
    order.total_amount = Math.round((discountedSubtotal + order.tax_amount + order.service_charge) * 100) / 100;

    const saved = await this.orderRepo.save(order);
    const fullOrder = await this.findOneOrder(saved.id);

    this.liveEventsService.publish({
      type: 'order_updated',
      branch_id: fullOrder.branch_id,
      restaurant_id: fullOrder.restaurant_id,
      target_roles: ['cashier', 'manager'],
      data: fullOrder,
    });

    return fullOrder;
  }

  async markPrinted(id: number): Promise<Order> {
    const order = await this.findOneOrder(id);
    order.printed_at = new Date();
    await this.orderRepo.save(order);

    this.liveEventsService.publish({
      type: 'ticket_printed',
      branch_id: order.branch_id,
      restaurant_id: order.restaurant_id,
      target_roles: ['kitchen', 'cashier'],
      data: { orderId: order.id, orderNumber: order.order_number, printedAt: order.printed_at },
    });

    return order;
  }

  async getActiveOrderByTable(tableId: number): Promise<{ activeOrder: Order | null; queuedOrders: Order[] }> {
    const orders = await this.orderRepo.find({
      where: {
        table_id: tableId,
        status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.VOIDED])),
        is_archived: false,
      },
      relations: ['items', 'table'],
      order: { id: 'ASC' },
    });

    const activeOrder = orders.find((o) => !o.is_queued) ?? (orders.length > 0 ? orders[0] : null);
    const queuedOrders = orders.filter((o) => o.id !== activeOrder?.id);

    return { activeOrder, queuedOrders };
  }
}
