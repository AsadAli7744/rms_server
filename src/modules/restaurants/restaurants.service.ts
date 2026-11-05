import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly repo: Repository<Restaurant>,
  ) {}

  async create(dto: CreateRestaurantDto, actorId?: number | null): Promise<Restaurant> {
    const exists = await this.repo.exist({
      where: { code: dto.code, is_archived: false },
    });
    if (exists) {
      throw new ConflictException(`Restaurant code "${dto.code}" already exists`);
    }
    const row = this.repo.create({
      ...dto,
      logo_url: dto.logo_url ?? null,
      support_dine_in: dto.support_dine_in ?? true,
      support_pickup: dto.support_pickup ?? true,
      support_delivery: dto.support_delivery ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async findAll(query: QueryRestaurantDto): Promise<{
    data: Restaurant[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo.createQueryBuilder('r');
    if (!query.include_archived) {
      qb.andWhere('r.is_archived = false');
    }
    if (query.status) {
      qb.andWhere('r.status = :status', { status: query.status });
    }
    if (query.q?.trim()) {
      qb.andWhere('(r.name ILIKE :q OR r.code ILIKE :q)', {
        q: `%${query.q.trim()}%`,
      });
    }
    qb.orderBy('r.id', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Restaurant> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Restaurant ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateRestaurantDto,
    actorId?: number | null,
  ): Promise<Restaurant> {
    const row = await this.findOne(id);
    if (dto.code && dto.code !== row.code) {
      const exists = await this.repo.exist({
        where: { code: dto.code, is_archived: false },
      });
      if (exists) {
        throw new ConflictException(`Restaurant code "${dto.code}" already exists`);
      }
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null): Promise<Restaurant> {
    const row = await this.findOne(id);
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.repo.save(row);
  }
}
