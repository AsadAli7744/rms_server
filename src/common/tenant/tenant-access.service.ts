import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { RequestUser } from '../decorators/current-user.decorator';
import { Branch } from '../../modules/branches/entities/branch.entity';
import { DiningTable } from '../../modules/dining-tables/entities/dining-table.entity';
import { Floor } from '../../modules/floors/entities/floor.entity';
import { Hall } from '../../modules/halls/entities/hall.entity';
import { Reservation } from '../../modules/reservations/entities/reservation.entity';
import { ServiceZone } from '../../modules/service-zones/entities/service-zone.entity';
import { MenuItem } from '../../modules/menu-items/entities/menu-item.entity';
import { MenuCategory } from '../../modules/menu-categories/entities/menu-category.entity';
import { ItemVariant } from '../../modules/menu-items/entities/item-variant.entity';
import { ItemAddonGroup } from '../../modules/menu-items/entities/item-addon-group.entity';
import { ItemAddonOption } from '../../modules/menu-items/entities/item-addon-option.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { OrderItem } from '../../modules/orders/entities/order-item.entity';
import { WebhookEndpoint } from '../../modules/webhooks/entities/webhook-endpoint.entity';
import { BranchMenuConfig } from '../../modules/branch-menu-config/entities/branch-menu-config.entity';

@Injectable()
export class TenantAccessService {
  constructor(
    @InjectRepository(Branch) private readonly branchRepo: Repository<Branch>,
    @InjectRepository(DiningTable) private readonly tableRepo: Repository<DiningTable>,
    @InjectRepository(Floor) private readonly floorRepo: Repository<Floor>,
    @InjectRepository(Hall) private readonly hallRepo: Repository<Hall>,
    @InjectRepository(Reservation) private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(ServiceZone) private readonly zoneRepo: Repository<ServiceZone>,
    @InjectRepository(MenuItem) private readonly itemRepo: Repository<MenuItem>,
    @InjectRepository(MenuCategory) private readonly categoryRepo: Repository<MenuCategory>,
    @InjectRepository(ItemVariant) private readonly variantRepo: Repository<ItemVariant>,
    @InjectRepository(ItemAddonGroup) private readonly groupRepo: Repository<ItemAddonGroup>,
    @InjectRepository(ItemAddonOption) private readonly optionRepo: Repository<ItemAddonOption>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(WebhookEndpoint) private readonly webhookRepo: Repository<WebhookEndpoint>,
    @InjectRepository(BranchMenuConfig) private readonly menuConfigRepo: Repository<BranchMenuConfig>,
  ) {}

  isAdmin(user?: RequestUser | null): boolean {
    return user?.role === UserRole.ADMIN;
  }

  /** Cashiers, kitchen, and waiters stay on the branch stored on their user row. */
  locksToAssignedBranch(user?: RequestUser | null): boolean {
    if (!user) return false;
    return user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER;
  }

  /**
   * Non-admins are locked to their own restaurant.
   * Admins stay on the tenant they selected unless a request names another one.
   */
  scopeRestaurant(user: RequestUser, requested?: number | null): number | undefined {
    if (this.isAdmin(user)) return requested ?? user.restaurant_id;
    return user.restaurant_id;
  }

  /**
   * Managers may omit the branch and see every branch of their restaurant.
   * Other staff are forced onto their assigned branch.
   */
  async resolveBranchFilter(
    user: RequestUser,
    requested?: number | null,
  ): Promise<number | undefined> {
    if (!this.locksToAssignedBranch(user)) {
      if (requested != null) await this.assertBranch(user, requested);
      return requested ?? undefined;
    }
    if (user.branch_id == null) {
      throw new ForbiddenException('This account is not assigned to a branch.');
    }
    if (requested != null && requested !== user.branch_id) {
      throw new ForbiddenException('Access denied: this record belongs to another branch.');
    }
    return user.branch_id;
  }

  ensureRestaurant(user: RequestUser | null | undefined, restaurantId: number): void {
    if (!user) {
      throw new ForbiddenException('Authentication is required.');
    }
    if (this.isAdmin(user)) return;
    if (user.restaurant_id !== restaurantId) {
      throw new ForbiddenException('Access denied: this record belongs to another restaurant.');
    }
  }

  async assertBranch(user: RequestUser | null | undefined, branchId: number): Promise<Branch> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch || branch.is_archived) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
    this.ensureRestaurant(user, branch.restaurant_id);
    if (user && this.locksToAssignedBranch(user)) {
      if (user.branch_id == null || user.branch_id !== branch.id) {
        throw new ForbiddenException(
          user.branch_id == null
            ? 'This account is not assigned to a branch.'
            : 'Access denied: this record belongs to another branch.',
        );
      }
    }
    return branch;
  }

  async assertTable(user: RequestUser | null | undefined, tableId: number): Promise<DiningTable> {
    const table = await this.tableRepo.findOne({ where: { id: tableId } });
    if (!table || table.is_archived) {
      throw new NotFoundException(`Dining table ${tableId} not found`);
    }
    await this.assertBranch(user, table.branch_id);
    return table;
  }

  async assertFloor(user: RequestUser | null | undefined, floorId: number): Promise<Floor> {
    const row = await this.floorRepo.findOne({ where: { id: floorId } });
    if (!row || row.is_archived) throw new NotFoundException(`Floor ${floorId} not found`);
    await this.assertBranch(user, row.branch_id);
    return row;
  }

  async assertHall(user: RequestUser | null | undefined, hallId: number): Promise<Hall> {
    const row = await this.hallRepo.findOne({ where: { id: hallId } });
    if (!row || row.is_archived) throw new NotFoundException(`Hall ${hallId} not found`);
    await this.assertBranch(user, row.branch_id);
    return row;
  }

  async assertReservation(user: RequestUser | null | undefined, id: number): Promise<Reservation> {
    const row = await this.reservationRepo.findOne({ where: { id } });
    if (!row || row.is_archived) throw new NotFoundException(`Reservation ${id} not found`);
    this.ensureRestaurant(user, row.restaurant_id);
    await this.assertBranch(user, row.branch_id);
    return row;
  }

  async assertServiceZone(user: RequestUser | null | undefined, id: number): Promise<ServiceZone> {
    const row = await this.zoneRepo.findOne({ where: { id } });
    if (!row || row.is_archived) throw new NotFoundException(`Service zone ${id} not found`);
    await this.assertBranch(user, row.branch_id);
    return row;
  }

  async assertMenuItem(user: RequestUser | null | undefined, itemId: number): Promise<MenuItem> {
    const row = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!row || row.is_archived) throw new NotFoundException(`Menu item ${itemId} not found`);
    this.ensureRestaurant(user, row.restaurant_id);
    return row;
  }

  async assertMenuCategory(user: RequestUser | null | undefined, categoryId: number): Promise<MenuCategory> {
    const row = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!row || row.is_archived) throw new NotFoundException(`Menu category ${categoryId} not found`);
    this.ensureRestaurant(user, row.restaurant_id);
    return row;
  }

  async assertVariant(user: RequestUser | null | undefined, variantId: number): Promise<ItemVariant> {
    const row = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!row || row.is_archived) throw new NotFoundException(`Variant ${variantId} not found`);
    await this.assertMenuItem(user, row.item_id);
    return row;
  }

  async assertAddonGroup(user: RequestUser | null | undefined, groupId: number): Promise<ItemAddonGroup> {
    const row = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!row || row.is_archived) throw new NotFoundException(`Add-on group ${groupId} not found`);
    await this.assertMenuItem(user, row.item_id);
    return row;
  }

  async assertAddonOption(user: RequestUser | null | undefined, optionId: number): Promise<ItemAddonOption> {
    const row = await this.optionRepo.findOne({ where: { id: optionId } });
    if (!row || row.is_archived) throw new NotFoundException(`Add-on option ${optionId} not found`);
    await this.assertAddonGroup(user, row.addon_group_id);
    return row;
  }

  async assertOrder(user: RequestUser | null | undefined, orderId: number): Promise<Order> {
    const row = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!row || row.is_archived) throw new NotFoundException(`Order ${orderId} not found`);
    this.ensureRestaurant(user, row.restaurant_id);
    await this.assertBranch(user, row.branch_id);
    return row;
  }

  async assertOrderItem(user: RequestUser | null | undefined, orderItemId: number): Promise<OrderItem> {
    const row = await this.orderItemRepo.findOne({
      where: { id: orderItemId },
      relations: ['order'],
    });
    if (!row?.order || row.is_archived) {
      throw new NotFoundException(`Order item ${orderItemId} not found`);
    }
    this.ensureRestaurant(user, row.order.restaurant_id);
    await this.assertBranch(user, row.order.branch_id);
    return row;
  }

  async assertWebhook(user: RequestUser | null | undefined, id: number): Promise<WebhookEndpoint> {
    const row = await this.webhookRepo.findOne({ where: { id } });
    if (!row || row.is_archived) throw new NotFoundException(`Webhook ${id} not found`);
    this.ensureRestaurant(user, row.restaurant_id);
    if (row.branch_id) {
      await this.assertBranch(user, row.branch_id);
    } else if (this.locksToAssignedBranch(user)) {
      throw new ForbiddenException('Access denied: this record belongs to another branch.');
    }
    return row;
  }

  async assertBranchMenuConfig(user: RequestUser | null | undefined, id: number): Promise<BranchMenuConfig> {
    const row = await this.menuConfigRepo.findOne({ where: { id } });
    if (!row || row.is_archived) throw new NotFoundException(`Branch menu config ${id} not found`);
    this.ensureRestaurant(user, row.restaurant_id);
    await this.assertBranch(user, row.branch_id);
    return row;
  }
}
