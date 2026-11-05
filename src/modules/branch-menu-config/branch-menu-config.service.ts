import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchMenuConfig } from './entities/branch-menu-config.entity';
import { Branch } from '../branches/entities/branch.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { UpsertBranchMenuConfigDto } from './dto/upsert-branch-menu-config.dto';
import { QueryBranchMenuConfigDto } from './dto/query-branch-menu-config.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';

@Injectable()
export class BranchMenuConfigService {
  constructor(
    @InjectRepository(BranchMenuConfig)
    private readonly repo: Repository<BranchMenuConfig>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(MenuItem)
    private readonly itemRepo: Repository<MenuItem>,
  ) {}

  async upsert(dto: UpsertBranchMenuConfigDto, actorId?: number | null) {
    const branch = await this.branchRepo.findOne({ where: { id: dto.branch_id } });
    if (!branch || branch.restaurant_id !== dto.restaurant_id) {
      throw new NotFoundException(
        `Branch ${dto.branch_id} not found for restaurant ${dto.restaurant_id}`,
      );
    }
    const item = await this.itemRepo.findOne({ where: { id: dto.item_id } });
    if (!item || item.restaurant_id !== dto.restaurant_id) {
      throw new NotFoundException(
        `Menu item ${dto.item_id} not found for restaurant ${dto.restaurant_id}`,
      );
    }
    let row = await this.repo.findOne({
      where: { branch_id: dto.branch_id, item_id: dto.item_id },
    });
    if (!row) {
      row = this.repo.create({
        restaurant_id: dto.restaurant_id,
        branch_id: dto.branch_id,
        item_id: dto.item_id,
      });
    }
    Object.assign(row, {
      is_available_in_branch: dto.is_available_in_branch ?? true,
      is_available_online: dto.is_available_online ?? true,
      is_available_pos: dto.is_available_pos ?? true,
      price_override: dto.price_override ?? null,
      pickup_available: dto.pickup_available ?? true,
      delivery_available: dto.delivery_available ?? true,
      dine_in_available: dto.dine_in_available ?? true,
      daily_limit: dto.daily_limit ?? null,
      sort_order: dto.sort_order ?? null,
      sold_out: dto.sold_out ?? false,
      notes: dto.notes ?? null,
      updated_by: actorId ?? null,
      created_by: row.created_by ?? actorId ?? null,
    });
    return this.repo.save(row);
  }

  async findAll(query: QueryBranchMenuConfigDto) {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo.createQueryBuilder('c');
    if (!query.include_archived) {
      qb.andWhere('c.is_archived = false');
    }
    if (query.restaurant_id != null) {
      qb.andWhere('c.restaurant_id = :rid', { rid: query.restaurant_id });
    }
    if (query.branch_id != null) {
      qb.andWhere('c.branch_id = :bid', { bid: query.branch_id });
    }
    if (query.item_id != null) {
      qb.andWhere('c.item_id = :iid', { iid: query.item_id });
    }
    qb.orderBy('c.id', 'ASC');
    qb.skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Branch menu config ${id} not found`);
    }
    return row;
  }

  async archive(id: number, actorId?: number | null) {
    const row = await this.findOne(id);
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.repo.save(row);
  }
}
