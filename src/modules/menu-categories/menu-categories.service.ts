import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { QueryMenuCategoryDto } from './dto/query-menu-category.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';

@Injectable()
export class MenuCategoriesService {
  constructor(
    @InjectRepository(MenuCategory)
    private readonly repo: Repository<MenuCategory>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async create(dto: CreateMenuCategoryDto, actorId?: number | null) {
    await this.assertRestaurant(dto.restaurant_id);
    const exists = await this.repo.exist({
      where: {
        restaurant_id: dto.restaurant_id,
        slug: dto.slug,
        is_archived: false,
      },
    });
    if (exists) {
      throw new ConflictException(`Category slug "${dto.slug}" already exists`);
    }
    const row = this.repo.create({
      ...dto,
      description: dto.description ?? null,
      image_url: dto.image_url ?? null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async findAll(query: QueryMenuCategoryDto) {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo.createQueryBuilder('c');
    if (!query.include_archived) {
      qb.andWhere('c.is_archived = false');
    }
    if (query.restaurant_id != null) {
      qb.andWhere('c.restaurant_id = :rid', { rid: query.restaurant_id });
    }
    qb.orderBy('c.sort_order', 'ASC').addOrderBy('c.id', 'ASC');
    qb.skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Menu category ${id} not found`);
    }
    return row;
  }

  async update(id: number, dto: UpdateMenuCategoryDto, actorId?: number | null) {
    const row = await this.findOne(id);
    if (dto.slug && dto.slug !== row.slug) {
      const exists = await this.repo.exist({
        where: {
          restaurant_id: row.restaurant_id,
          slug: dto.slug,
          is_archived: false,
        },
      });
      if (exists) {
        throw new ConflictException(`Category slug "${dto.slug}" already exists`);
      }
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

  private async assertRestaurant(id: number) {
    const ok = await this.restaurantRepo.exist({ where: { id } });
    if (!ok) {
      throw new NotFoundException(`Restaurant ${id} not found`);
    }
  }
}
