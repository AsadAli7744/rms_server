import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KitchenService } from './kitchen.service';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { LiveEventsService } from '../live-events/live-events.service';
import { KitchenItemStatus, OrderStatus, StationType } from '../../common/enums';

describe('KitchenService', () => {
  let service: KitchenService;
  let orderRepo: any;
  let orderItemRepo: any;
  let liveEventsService: any;

  beforeEach(async () => {
    orderRepo = {
      findOne: jest.fn(),
      save: jest.fn((e) => Promise.resolve(e)),
    };
    orderItemRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn((e) => Promise.resolve(e)),
    };
    liveEventsService = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitchenService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemRepo },
        { provide: LiveEventsService, useValue: liveEventsService },
      ],
    }).compile();

    service = module.get<KitchenService>(KitchenService);
  });

  it('should generate properly formatted thermal ticket for kitchen thermal printer', () => {
    const mockOrder: any = {
      id: 1,
      order_number: 'ORD-20261104-5544',
      created_at: new Date('2026-11-04T12:00:00Z'),
      table: { code: 'T-07' },
      waiter_name: 'Alex',
      notes: 'No onions please',
      items: [
        {
          quantity: 2,
          item_name: 'Cold Drink',
          variant_name: 'Diet',
          notes: 'Extra ice',
        },
        {
          quantity: 1,
          item_name: 'Caesar Salad',
          variant_name: null,
          notes: null,
        },
      ],
    };

    const ticket = service.generateThermalTicket(mockOrder);
    expect(ticket).toContain('KITCHEN ORDER TICKET');
    expect(ticket).toContain('ORD-20261104-5544');
    expect(ticket).toContain('T-07');
    expect(ticket).toContain('2x   Cold Drink (Diet)');
    expect(ticket).toContain('Extra ice');
    expect(ticket).toContain('No onions please');
    expect(ticket).toContain('Auto-printed to Kitchen Thermal Printer');
  });

  it('should update item status and emit live event', async () => {
    orderItemRepo.findOne.mockResolvedValue({
      id: 10,
      order_id: 1,
      status: KitchenItemStatus.QUEUED,
      is_archived: false,
    });
    orderItemRepo.find.mockResolvedValue([
      { id: 10, status: KitchenItemStatus.READY },
    ]);
    orderRepo.findOne.mockResolvedValue({
      id: 1,
      branch_id: 1,
      restaurant_id: 1,
      status: OrderStatus.PLACED,
    });

    const result = await service.updateItemStatus(10, KitchenItemStatus.READY);
    expect(result.status).toBe(KitchenItemStatus.READY);
    expect(liveEventsService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'order_status_changed',
        target_roles: ['kitchen', 'cashier'],
      }),
    );
  });
});
