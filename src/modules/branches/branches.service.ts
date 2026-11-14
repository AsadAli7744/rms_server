import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(MenuItem)
    private readonly itemRepo: Repository<MenuItem>,
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
    if (query.id != null) {
      qb.andWhere('b.id = :branchId', { branchId: query.id });
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

  /** First live branch for a restaurant, creating a main branch when none exists. */
  async ensureDefaultBranch(
    restaurantId: number,
    actorId?: number | null,
  ): Promise<Branch> {
    const existing = await this.repo.findOne({
      where: { restaurant_id: restaurantId, is_archived: false },
      order: { id: 'ASC' },
      relations: ['restaurant'],
    });
    if (existing) return existing;

    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    }

    const codeRoot = (restaurant.code || `R${restaurantId}`)
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 24) || `R${restaurantId}`;

    try {
      return await this.create(
        {
          restaurant_id: restaurantId,
          name: restaurant.name,
          code: `${codeRoot}-MAIN`,
          address_line_1: restaurant.name,
          city: 'Main',
          country: 'Pakistan',
        },
        actorId,
      );
    } catch (err) {
      if (!(err instanceof ConflictException)) throw err;
      return this.create(
        {
          restaurant_id: restaurantId,
          name: restaurant.name,
          code: `${codeRoot}-MAIN-${restaurantId}`,
          address_line_1: restaurant.name,
          city: 'Main',
          country: 'Pakistan',
        },
        actorId,
      );
    }
  }

  /** Point the user at their restaurant's branch when they have none, or the wrong one. */
  async attachUserToRestaurantBranch(userId: number, branch: Branch): Promise<void> {
    if (!userId) return;
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.restaurant_id !== branch.restaurant_id) return;
    if (user.branch_id) {
      const current = await this.repo.findOne({ where: { id: user.branch_id } });
      if (current && current.restaurant_id === branch.restaurant_id && !current.is_archived) {
        return;
      }
    }
    user.branch_id = branch.id;
    await this.userRepo.save(user);
  }

  /** Public QR menu: this branch's restaurant, currency, and active items. */
  async getOrderingMenu(branchId: number) {
    const branch = await this.repo.findOne({
      where: { id: branchId, is_archived: false },
      relations: ['restaurant'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
    const items = await this.itemRepo.find({
      where: {
        restaurant_id: branch.restaurant_id,
        is_archived: false,
        is_active: true,
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
    return {
      branch: {
        id: branch.id,
        name: branch.name,
        restaurant_id: branch.restaurant_id,
      },
      restaurant: {
        id: branch.restaurant.id,
        name: branch.restaurant.name,
        default_currency: branch.restaurant.default_currency,
      },
      items,
    };
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
