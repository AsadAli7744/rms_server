import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Branch } from '../branches/entities/branch.entity';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebhookEndpoint,
      WebhookDelivery,
      Restaurant,
      Branch,
    ]),
  ],
  controllers: [WebhooksController],
  providers: [WebhookDispatchService, WebhooksService],
  exports: [WebhookDispatchService, WebhooksService, TypeOrmModule],
})
export class WebhooksModule {}
