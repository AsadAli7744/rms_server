import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Branch } from '../branches/entities/branch.entity';
import { DiningTable } from '../dining-tables/entities/dining-table.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { ItemVariant } from '../menu-items/entities/item-variant.entity';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Restaurant,
      Branch,
      DiningTable,
      MenuItem,
      ItemVariant,
    ]),
    WebhooksModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
