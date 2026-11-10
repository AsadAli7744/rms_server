import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { ItemSalesQueryDto, SalesSummaryQueryDto } from './dto/reports-query.dto';
import { OrderStatus } from '../../common/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
  ) {}

  async getItemSales(query: ItemSalesQueryDto) {
    const qb = this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .leftJoin('oi.item', 'm')
      .leftJoin('m.category', 'c')
      .select([
        'oi.item_id AS item_id',
        'oi.item_name AS item_name',
        'c.name AS category_name',
        'm.sku AS sku',
        'COALESCE(m.stock_quantity, 0) AS stock_quantity',
        'm.track_stock AS track_stock',
        'COALESCE(m.low_stock_threshold, 10) AS low_stock_threshold',
        'SUM(oi.quantity) AS total_quantity',
        'SUM(oi.subtotal) AS total_revenue',
        'COUNT(DISTINCT o.id) AS orders_count',
      ])
      .where('o.branch_id = :branchId', { branchId: query.branch_id })
      .andWhere('o.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.VOIDED],
      })
      .andWhere('o.is_archived = false')
      .andWhere('oi.is_archived = false');

    if (query.start_date) {
      qb.andWhere('o.created_at >= :startDate', {
        startDate: new Date(query.start_date),
      });
    }

    if (query.end_date) {
      qb.andWhere('o.created_at <= :endDate', {
        endDate: new Date(query.end_date),
      });
    }

    let parsedItemIds: number[] = [];
    if (query.item_ids) {
      parsedItemIds = query.item_ids
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (parsedItemIds.length > 0) {
        qb.andWhere('oi.item_id IN (:...itemIds)', { itemIds: parsedItemIds });
      }
    }

    qb.groupBy('oi.item_id')
      .addGroupBy('oi.item_name')
      .addGroupBy('c.name')
      .addGroupBy('m.sku')
      .addGroupBy('m.stock_quantity')
      .addGroupBy('m.track_stock')
      .addGroupBy('m.low_stock_threshold')
      .orderBy('total_quantity', 'DESC');

    const rawItems = await qb.getRawMany();

    const items = rawItems.map((r) => ({
      item_id: Number(r.item_id),
      item_name: r.item_name,
      category_name: r.category_name ?? 'Uncategorized',
      sku: r.sku ?? null,
      stock_quantity: Number(r.stock_quantity) || 0,
      track_stock: Boolean(r.track_stock),
      low_stock_threshold: Number(r.low_stock_threshold) || 10,
      total_quantity: Number(r.total_quantity) || 0,
      total_revenue: Number(r.total_revenue) || 0,
      orders_count: Number(r.orders_count) || 0,
      avg_price_per_unit:
        Number(r.total_quantity) > 0
          ? Math.round((Number(r.total_revenue) / Number(r.total_quantity)) * 100) / 100
          : 0,
    }));

    const totalUnitsSold = items.reduce((sum, i) => sum + i.total_quantity, 0);
    const totalRevenue = items.reduce((sum, i) => sum + i.total_revenue, 0);
    const totalStockOnHand = items.reduce((sum, i) => sum + (i.track_stock ? i.stock_quantity : 0), 0);
    const lowStockCount = items.filter((i) => i.track_stock && i.stock_quantity <= i.low_stock_threshold).length;

    // Fetch periodic timeline breakdown (daily / weekly / monthly)
    const timelineQb = this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .select([
        `TO_CHAR(o.created_at, '${query.period === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD'}') AS date_bucket`,
        'oi.item_id AS item_id',
        'oi.item_name AS item_name',
        'SUM(oi.quantity) AS quantity',
        'SUM(oi.subtotal) AS revenue',
      ])
      .where('o.branch_id = :branchId', { branchId: query.branch_id })
      .andWhere('o.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.VOIDED],
      })
      .andWhere('o.is_archived = false')
      .andWhere('oi.is_archived = false');

    if (query.start_date) {
      timelineQb.andWhere('o.created_at >= :startDate', {
        startDate: new Date(query.start_date),
      });
    }
    if (query.end_date) {
      timelineQb.andWhere('o.created_at <= :endDate', {
        endDate: new Date(query.end_date),
      });
    }
    if (parsedItemIds.length > 0) {
      timelineQb.andWhere('oi.item_id IN (:...itemIds)', { itemIds: parsedItemIds });
    }

    timelineQb
      .groupBy('date_bucket')
      .addGroupBy('oi.item_id')
      .addGroupBy('oi.item_name')
      .orderBy('date_bucket', 'ASC');

    const rawTimeline = await timelineQb.getRawMany();

    // Group timeline by date bucket
    const timelineMap: Record<
      string,
      { date: string; total_quantity: number; total_revenue: number; items: any[] }
    > = {};

    for (const row of rawTimeline) {
      const b = row.date_bucket;
      if (!timelineMap[b]) {
        timelineMap[b] = {
          date: b,
          total_quantity: 0,
          total_revenue: 0,
          items: [],
        };
      }
      const qty = Number(row.quantity) || 0;
      const rev = Number(row.revenue) || 0;
      timelineMap[b].total_quantity += qty;
      timelineMap[b].total_revenue += rev;
      timelineMap[b].items.push({
        item_id: Number(row.item_id),
        item_name: row.item_name,
        quantity: qty,
        revenue: rev,
      });
    }

    return {
      branch_id: query.branch_id,
      filters: {
        item_ids: parsedItemIds,
        start_date: query.start_date ?? null,
        end_date: query.end_date ?? null,
        period: query.period ?? 'daily',
      },
      summary: {
        total_units_sold: totalUnitsSold,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_stock_on_hand: totalStockOnHand,
        low_stock_count: lowStockCount,
        distinct_items_count: items.length,
      },
      items,
      timeline: Object.values(timelineMap),
    };
  }

  async getSalesSummary(query: SalesSummaryQueryDto) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .where('order.branch_id = :branchId', { branchId: query.branch_id })
      .andWhere('order.is_archived = false');

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

    const orders = await qb.getMany();

    let totalOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let grossSales = 0;
    let totalDiscounts = 0;
    let discountedOrdersCount = 0;
    let netSales = 0;
    let totalTax = 0;
    let totalPaid = 0;

    const discountReasons: Record<string, { count: number; total_amount: number }> = {};
    const paymentMethods: Record<string, number> = {};

    for (const order of orders) {
      totalOrders++;
      if (order.status === OrderStatus.COMPLETED) {
        completedOrders++;
      } else if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.VOIDED) {
        cancelledOrders++;
        continue;
      }

      const sub = Number(order.subtotal) || 0;
      const disc = Number(order.discount_amount) || 0;
      const tax = Number(order.tax_amount) || 0;
      const tot = Number(order.total_amount) || 0;
      const paid = Number(order.paid_amount) || 0;

      grossSales += sub;
      totalTax += tax;
      netSales += tot;
      totalPaid += paid;

      if (disc > 0) {
        totalDiscounts += disc;
        discountedOrdersCount++;
        const reason = order.discount_reason?.trim() || 'General Discount';
        if (!discountReasons[reason]) {
          discountReasons[reason] = { count: 0, total_amount: 0 };
        }
        discountReasons[reason].count++;
        discountReasons[reason].total_amount += disc;
      }

      if (order.payment_method) {
        paymentMethods[order.payment_method] =
          (paymentMethods[order.payment_method] || 0) + tot;
      }
    }

    return {
      branch_id: query.branch_id,
      date_range: {
        start_date: query.start_date ?? null,
        end_date: query.end_date ?? null,
      },
      metrics: {
        total_orders: totalOrders,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        gross_sales: Math.round(grossSales * 100) / 100,
        total_discounts: Math.round(totalDiscounts * 100) / 100,
        discounted_orders_count: discountedOrdersCount,
        avg_discount_per_order:
          discountedOrdersCount > 0
            ? Math.round((totalDiscounts / discountedOrdersCount) * 100) / 100
            : 0,
        net_sales: Math.round(netSales * 100) / 100,
        total_tax: Math.round(totalTax * 100) / 100,
        total_paid: Math.round(totalPaid * 100) / 100,
      },
      discounts_by_reason: Object.entries(discountReasons).map(([reason, data]) => ({
        reason,
        count: data.count,
        total_amount: Math.round(data.total_amount * 100) / 100,
      })),
      payment_methods_breakdown: paymentMethods,
    };
  }
}
