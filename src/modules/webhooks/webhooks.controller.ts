import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { UpdateWebhookEndpointDto } from './dto/update-webhook-endpoint.dto';
import { QueryWebhookEndpointDto } from './dto/query-webhook-endpoint.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('endpoints')
  @ApiOperation({ summary: 'Create webhook endpoint' })
  create(@Body() dto: CreateWebhookEndpointDto) {
    return this.webhooksService.create(dto);
  }

  @Get('endpoints')
  @ApiOperation({ summary: 'List webhook endpoints' })
  listEndpoints(@Query() query: QueryWebhookEndpointDto) {
    return this.webhooksService.findAll(query);
  }

  @Get('endpoints/:id')
  @ApiOperation({ summary: 'Get webhook endpoint' })
  getEndpoint(@Param('id', ParseIntPipe) id: number) {
    return this.webhooksService.findOne(id);
  }

  @Patch('endpoints/:id')
  @ApiOperation({ summary: 'Update webhook endpoint' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWebhookEndpointDto,
  ) {
    return this.webhooksService.update(id, dto);
  }

  @Post('endpoints/:id/archive')
  @ApiOperation({ summary: 'Archive webhook endpoint' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.webhooksService.archive(id);
  }

  @Post('endpoints/:id/test')
  @ApiOperation({ summary: 'Send test ping to endpoint' })
  test(@Param('id', ParseIntPipe) id: number) {
    return this.webhooksService.testPing(id);
  }

  @Get('endpoints/:id/deliveries')
  @ApiOperation({ summary: 'List delivery attempts for endpoint' })
  deliveries(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryWebhookEndpointDto,
  ) {
    return this.webhooksService.listDeliveries(id, query);
  }
}
