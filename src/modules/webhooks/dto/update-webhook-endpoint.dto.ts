import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWebhookEndpointDto } from './create-webhook-endpoint.dto';

export class UpdateWebhookEndpointDto extends PartialType(
  OmitType(CreateWebhookEndpointDto, ['restaurant_id'] as const),
) {}
