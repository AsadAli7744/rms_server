import {
  Body,
  Controller,
  ForbiddenException,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly access: TenantAccessService,
  ) {}

  @Post('endpoints')
  @ApiOperation({ summary: 'Create webhook endpoint' })
  async create(@Body() dto: CreateWebhookEndpointDto, @CurrentUser() user: RequestUser) {
    if (!this.access.isAdmin(user)) dto.restaurant_id = user.restaurant_id;
    this.access.ensureRestaurant(user, dto.restaurant_id);
    if (this.access.locksToAssignedBranch(user)) {
      if (user.branch_id == null) {
        throw new ForbiddenException('This account is not assigned to a branch.');
      }
      dto.branch_id = user.branch_id;
    }
    if (dto.branch_id) await this.access.assertBranch(user, dto.branch_id);
    return this.webhooksService.create(dto);
  }

  @Get('endpoints')
  @ApiOperation({ summary: 'List webhook endpoints' })
  async listEndpoints(@Query() query: QueryWebhookEndpointDto, @CurrentUser() user: RequestUser) {
    query.restaurant_id = this.access.scopeRestaurant(user, query.restaurant_id);
    query.branch_id = await this.access.resolveBranchFilter(user, query.branch_id);
    return this.webhooksService.findAll(query);
  }

  @Get('endpoints/:id')
  @ApiOperation({ summary: 'Get webhook endpoint' })
  async getEndpoint(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertWebhook(user, id);
    return this.webhooksService.findOne(id);
  }

  @Patch('endpoints/:id')
  @ApiOperation({ summary: 'Update webhook endpoint' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWebhookEndpointDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertWebhook(user, id);
    if (dto.branch_id) await this.access.assertBranch(user, dto.branch_id);
    return this.webhooksService.update(id, dto);
  }

  @Post('endpoints/:id/archive')
  @ApiOperation({ summary: 'Archive webhook endpoint' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertWebhook(user, id);
    return this.webhooksService.archive(id);
  }

  @Post('endpoints/:id/test')
  @ApiOperation({ summary: 'Send test ping to endpoint' })
  async test(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertWebhook(user, id);
    return this.webhooksService.testPing(id);
  }

  @Get('endpoints/:id/deliveries')
  @ApiOperation({ summary: 'List delivery attempts for endpoint' })
  async deliveries(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryWebhookEndpointDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertWebhook(user, id);
    return this.webhooksService.listDeliveries(id, query);
  }
}
