import * as dotenv from 'dotenv';
import * as path from 'path';

// Automatically load .env from current working dir or project root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { SharedModule } from './common/shared/shared.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { BranchOperatingHoursModule } from './modules/branch-operating-hours/branch-operating-hours.module';
import { ServiceZonesModule } from './modules/service-zones/service-zones.module';
import { DiningTablesModule } from './modules/dining-tables/dining-tables.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { FloorsModule } from './modules/floors/floors.module';
import { HallsModule } from './modules/halls/halls.module';
import { MenuCategoriesModule } from './modules/menu-categories/menu-categories.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { BranchMenuConfigModule } from './modules/branch-menu-config/branch-menu-config.module';
import { UsersModule } from './modules/users/users.module';
import { LiveEventsModule } from './modules/live-events/live-events.module';
import { OrdersModule } from './modules/orders/orders.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TenantModule } from './common/tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const databaseUrl =
          process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl:
              process.env.DB_SSL === 'false'
                ? false
                : { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: process.env.DB_SYNCHRONIZE !== 'false',
            migrationsRun: false,
            logging: process.env.TYPEORM_LOGGING === 'true',
          };
        }

        return {
          type: (process.env.DB_TYPE as any) ?? 'postgres',
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '5432', 10),
          username: process.env.DB_USER ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'postgres',
          database: process.env.DB_NAME ?? 'rms',
          autoLoadEntities: true,
          synchronize: process.env.DB_SYNCHRONIZE !== 'false',
          migrationsRun: false,
          logging: process.env.TYPEORM_LOGGING === 'true',
        };
      },
    }),
    SharedModule,
    TenantModule,
    LiveEventsModule,
    RestaurantsModule,
    BranchesModule,
    BranchOperatingHoursModule,
    ServiceZonesModule,
    DiningTablesModule,
    ReservationsModule,
    WebhooksModule,
    FloorsModule,
    HallsModule,
    MenuCategoriesModule,
    MenuItemsModule,
    BranchMenuConfigModule,
    UsersModule,
    OrdersModule,
    KitchenModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
