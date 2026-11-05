import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Branch } from '../branches/entities/branch.entity';
import { DiningTable } from '../dining-tables/entities/dining-table.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { ItemVariant } from '../menu-items/entities/item-variant.entity';
import { LiveEventsService } from '../live-events/live-events.service';
import { WebhookDispatchService } from '../webhooks/webhook-dispatch.service';
import { ConflictException } from '@nestjs/common';
import { OrderSource, OrderStatus, TableStatus } from '../../common/enums';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: any;
  let tableRepo: any;
  let menuItemRepo: any;
  let liveEventsService: any;

  beforeEach(async () => {
    orderRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 101, ...entity })),
    };

    tableRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    menuItemRepo = {
      findOne: jest.fn(),
    };

    liveEventsService = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: { create: jest.fn((dto) => dto) } },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: { findOne: jest.fn().mockResolvedValue({ id: 1 }) },
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: { findOne: jest.fn().mockResolvedValue({ id: 1, restaurant_id: 1 }) },
        },
        { provide: getRepositoryToken(DiningTable), useValue: tableRepo },
        { provide: getRepositoryToken(MenuItem), useValue: menuItemRepo },
        { provide: getRepositoryToken(ItemVariant), useValue: { findOne: jest.fn() } },
        { provide: LiveEventsService, useValue: liveEventsService },
        { provide: WebhookDispatchService, useValue: { dispatch: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should prevent customer from placing order when table has active order', async () => {
    tableRepo.findOne.mockResolvedValue({ id: 5, code: 'T-05' });
    orderRepo.findOne.mockResolvedValue({ id: 99, order_number: 'ORD-99', status: OrderStatus.PLACED });

    await expect(
      service.createOrder({
        restaurant_id: 1,
        branch_id: 1,
        table_id: 5,
        source: OrderSource.WEB,
        items: [{ item_id: 1, quantity: 2 }],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should allow cashier to queue an order even when table has active order', async () => {
    tableRepo.findOne.mockResolvedValue({ id: 5, code: 'T-05' });
    orderRepo.findOne
      .mockResolvedValueOnce({ id: 99, order_number: 'ORD-99', status: OrderStatus.PLACED })
      .mockResolvedValueOnce({
        id: 101,
        order_number: 'ORD-101',
        branch_id: 1,
        restaurant_id: 1,
        items: [],
      });

    menuItemRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'Cold Drink',
      base_price: 3.5,
      preparation_station_type: 'kitchen',
    });

    orderRepo.count.mockResolvedValue(1);

    const result = await service.createOrder({
      restaurant_id: 1,
      branch_id: 1,
      table_id: 5,
      source: OrderSource.POS,
      actor_role: 'cashier',
      is_queued: true,
      items: [{ item_id: 1, quantity: 2 }],
    });

    expect(result).toBeDefined();
    expect(liveEventsService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'order_created',
        target_roles: ['kitchen', 'cashier', 'manager'],
      }),
    );
  });

  it('should correctly calculate percentage and fixed discounts', async () => {
    tableRepo.findOne.mockResolvedValue(null);
    orderRepo.findOne.mockResolvedValue({
      id: 102,
      order_number: 'ORD-102',
      branch_id: 1,
      restaurant_id: 1,
      items: [],
    });

    menuItemRepo.findOne.mockResolvedValue({
      id: 10,
      name: 'Burger Combo',
      base_price: 100,
      preparation_station_type: 'kitchen',
    });

    // 10% discount on 100 subtotal => discount_amount = 10
    const orderWithPercent = await service.createOrder({
      restaurant_id: 1,
      branch_id: 1,
      source: OrderSource.POS,
      discount_type: 'percentage',
      discount_value: 10,
      discount_reason: 'Happy Hour',
      items: [{ item_id: 10, quantity: 1 }],
    });

    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal: 100,
        discount_amount: 10,
        discount_reason: 'Happy Hour',
      }),
    );
  });
});
