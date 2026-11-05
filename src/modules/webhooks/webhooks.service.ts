import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { UpdateWebhookEndpointDto } from './dto/update-webhook-endpoint.dto';
import { QueryWebhookEndpointDto } from './dto/query-webhook-endpoint.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { WebhookEventType } from '../../common/enums';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Branch } from '../branches/entities/branch.entity';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly repo: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepo: Repository<WebhookDelivery>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly dispatcher: WebhookDispatchService,
  ) {}

  async create(dto: CreateWebhookEndpointDto, actorId?: number | null) {
    await this.assertRestaurant(dto.restaurant_id);
    if (dto.branch_id != null) {
      await this.assertBranchBelongs(dto.branch_id, dto.restaurant_id);
    }
    const row = this.repo.create({
      restaurant_id: dto.restaurant_id,
      branch_id: dto.branch_id ?? null,
      label: dto.label,
      target_url: dto.target_url,
      secret: dto.secret ?? null,
      subscribed_events: dto.subscribed_events,
      is_active: dto.is_active ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async findAll(query: QueryWebhookEndpointDto) {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo.createQueryBuilder('w');
    if (!query.include_archived) {
      qb.andWhere('w.is_archived = false');
    }
    if (query.restaurant_id != null) {
      qb.andWhere('w.restaurant_id = :rid', { rid: query.restaurant_id });
    }
    if (query.branch_id != null) {
      qb.andWhere('w.branch_id = :bid', { bid: query.branch_id });
    }
    qb.orderBy('w.id', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Webhook endpoint ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateWebhookEndpointDto,
    actorId?: number | null,
  ) {
    const row = await this.findOne(id);
    if (dto.branch_id !== undefined && dto.branch_id != null) {
      await this.assertBranchBelongs(dto.branch_id, row.restaurant_id);
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null) {
    const row = await this.findOne(id);
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.repo.save(row);
  }

  async testPing(id: number) {
    const row = await this.findOne(id);
    await this.dispatcher.dispatch(
      row.restaurant_id,
      WebhookEventType.TEST_PING,
      { endpoint_id: row.id, message: 'Webhook test ping' },
      row.branch_id,
    );
    return { ok: true };
  }

  async listDeliveries(endpointId: number, query: QueryWebhookEndpointDto) {
    await this.findOne(endpointId);
    const { page, limit, skip } = normalizePagination(query);
    const [data, total] = await this.deliveryRepo.findAndCount({
      where: { endpoint_id: endpointId },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  private async assertRestaurant(id: number): Promise<void> {
    const ok = await this.restaurantRepo.exist({ where: { id } });
    if (!ok) {
      throw new NotFoundException(`Restaurant ${id} not found`);
    }
  }

  private async assertBranchBelongs(
    branchId: number,
    restaurantId: number,
  ): Promise<void> {
    const b = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!b) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
    if (b.restaurant_id !== restaurantId) {
      throw new ConflictException('Branch does not belong to restaurant');
    }
  }
}
