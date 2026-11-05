import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Floor } from './entities/floor.entity';
import { Branch } from '../branches/entities/branch.entity';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';

@Injectable()
export class FloorsService {
  constructor(
    @InjectRepository(Floor)
    private readonly repo: Repository<Floor>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(
    branchId: number,
    dto: CreateFloorDto,
    actorId?: number | null,
  ): Promise<Floor> {
    await this.assertBranch(branchId);
    const exists = await this.repo.exist({
      where: { branch_id: branchId, name: dto.name, is_archived: false },
    });
    if (exists) {
      throw new ConflictException(
        `Floor name "${dto.name}" already exists for this branch`,
      );
    }
    const row = this.repo.create({
      branch_id: branchId,
      name: dto.name,
      code: dto.code ?? null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async listByBranch(branchId: number, query: QueryFloorDto) {
    await this.assertBranch(branchId);
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo
      .createQueryBuilder('f')
      .where('f.branch_id = :bid', { bid: branchId });
    if (!query.include_archived) {
      qb.andWhere('f.is_archived = false');
    }
    qb.orderBy('f.sort_order', 'ASC').addOrderBy('f.id', 'ASC');
    qb.skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Floor> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Floor ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateFloorDto,
    actorId?: number | null,
  ): Promise<Floor> {
    const row = await this.findOne(id);
    if (dto.name && dto.name !== row.name) {
      const exists = await this.repo.exist({
        where: { branch_id: row.branch_id, name: dto.name, is_archived: false },
      });
      if (exists) {
        throw new ConflictException(
          `Floor name "${dto.name}" already exists for this branch`,
        );
      }
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null): Promise<Floor> {
    const row = await this.findOne(id);
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.repo.save(row);
  }

  private async assertBranch(branchId: number): Promise<void> {
    const ok = await this.branchRepo.exist({ where: { id: branchId } });
    if (!ok) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
  }
}
