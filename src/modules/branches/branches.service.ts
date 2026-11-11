import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchDto } from './dto/query-branch.dto';
import { BranchStatus, TaxMode } from '../../common/enums';
import { normalizePagination } from '../../common/shared/utils/pagination.util';
import { BranchSettingsService } from '../branch-settings/branch-settings.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly branchSettingsService: BranchSettingsService,
  ) {}

  async create(dto: CreateBranchDto, actorId?: number | null): Promise<Branch> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: dto.restaurant_id },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${dto.restaurant_id} not found`);
    }
    const exists = await this.repo.exist({
      where: {
        restaurant_id: dto.restaurant_id,
        code: dto.code,
        is_archived: false,
      },
    });
    if (exists) {
      throw new ConflictException(
        `Branch code "${dto.code}" already exists for this restaurant`,
      );
    }
    const row = this.repo.create({
      restaurant_id: dto.restaurant_id,
      name: dto.name,
      code: dto.code,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      address_line_1: dto.address_line_1,
      address_line_2: dto.address_line_2 ?? null,
      city: dto.city,
      area: dto.area ?? null,
      state: dto.state ?? null,
      country: dto.country,
      postal_code: dto.postal_code ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      online_ordering_enabled: dto.online_ordering_enabled ?? true,
      pickup_enabled: dto.pickup_enabled ?? true,
      delivery_enabled: dto.delivery_enabled ?? true,
      dine_in_enabled: dto.dine_in_enabled ?? true,
      branch_status: dto.branch_status ?? BranchStatus.ACTIVE,
      estimated_prep_time_minutes: dto.estimated_prep_time_minutes ?? 20,
      minimum_order_amount: dto.minimum_order_amount ?? null,
      packing_charge: dto.packing_charge ?? null,
      service_charge: dto.service_charge ?? null,
      tax_mode: dto.tax_mode ?? TaxMode.EXCLUSIVE,
      default_tax_rate: dto.default_tax_rate ?? null,
      notes: dto.notes ?? null,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    const saved = await this.repo.save(row);
    await this.branchSettingsService.ensureDefaultForBranch(saved.id);
    return saved;
  }

  async findAll(query: QueryBranchDto): Promise<{
    data: Branch[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo.createQueryBuilder('b');
    if (!query.include_archived) {
      qb.andWhere('b.is_archived = false');
    }
    if (query.restaurant_id != null) {
      qb.andWhere('b.restaurant_id = :rid', { rid: query.restaurant_id });
    }
    if (query.branch_status) {
      qb.andWhere('b.branch_status = :bs', { bs: query.branch_status });
    }
    if (query.q?.trim()) {
      qb.andWhere('(b.name ILIKE :q OR b.code ILIKE :q)', {
        q: `%${query.q.trim()}%`,
      });
    }
    qb.orderBy('b.id', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Branch> {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!row) {
      throw new NotFoundException(`Branch ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateBranchDto,
    actorId?: number | null,
  ): Promise<Branch> {
    const row = await this.findOne(id);
    if (dto.code && dto.code !== row.code) {
      const exists = await this.repo.exist({
        where: {
          restaurant_id: row.restaurant_id,
          code: dto.code,
          is_archived: false,
        },
      });
      if (exists) {
        throw new ConflictException(
          `Branch code "${dto.code}" already exists for this restaurant`,
        );
      }
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null): Promise<Branch> {
    const row = await this.findOne(id);
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.repo.save(row);
  }
}
