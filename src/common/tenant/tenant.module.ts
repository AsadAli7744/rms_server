import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantAuthGuard } from '../guards/tenant-auth.guard';
import { TenantAccessService } from './tenant-access.service';
import { User } from '../../modules/users/entities/user.entity';
import { Restaurant } from '../../modules/restaurants/entities/restaurant.entity';
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

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Restaurant,
      Branch,
      DiningTable,
      Floor,
      Hall,
      Reservation,
      ServiceZone,
      MenuItem,
      MenuCategory,
      ItemVariant,
      ItemAddonGroup,
      ItemAddonOption,
      Order,
      OrderItem,
      WebhookEndpoint,
      BranchMenuConfig,
    ]),
  ],
  providers: [
    TenantAccessService,
    TenantAuthGuard,
    { provide: APP_GUARD, useClass: TenantAuthGuard },
  ],
  exports: [TenantAccessService, TenantAuthGuard],
})
export class TenantModule {}
