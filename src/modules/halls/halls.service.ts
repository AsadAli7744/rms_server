import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hall } from './entities/hall.entity';
import { Floor } from '../floors/entities/floor.entity';
import { Branch } from '../branches/entities/branch.entity';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { QueryHallDto } from './dto/query-hall.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall)
    private readonly repo: Repository<Hall>,
    @InjectRepository(Floor)
    private readonly floorRepo: Repository<Floor>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(
    branchId: number,
    dto: CreateHallDto,
    actorId?: number | null,
  ): Promise<Hall> {
    await this.assertBranch(branchId);
    const floor = await this.floorRepo.findOne({ where: { id: dto.floor_id } });
    if (!floor || floor.branch_id !== branchId) {
      throw new NotFoundException(
        `Floor ${dto.floor_id} not found for branch ${branchId}`,
      );
    }
    const exists = await this.repo.exist({
      where: {
        branch_id: branchId,
        floor_id: dto.floor_id,
        name: dto.name,
        is_archived: false,
      },
    });
    if (exists) {
      throw new ConflictException(
        `Hall name "${dto.name}" already exists on this floor`,
      );
    }
    const row = this.repo.create({
      branch_id: branchId,
      floor_id: dto.floor_id,
      name: dto.name,
      code: dto.code ?? null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async listByBranch(branchId: number, query: QueryHallDto) {
    await this.assertBranch(branchId);
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo
      .createQueryBuilder('h')
      .where('h.branch_id = :bid', { bid: branchId });
    if (!query.include_archived) {
      qb.andWhere('h.is_archived = false');
    }
    if (query.floor_id != null) {
      qb.andWhere('h.floor_id = :fid', { fid: query.floor_id });
    }
    qb.orderBy('h.sort_order', 'ASC').addOrderBy('h.id', 'ASC');
    qb.skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Hall> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Hall ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateHallDto,
    actorId?: number | null,
  ): Promise<Hall> {
    const row = await this.findOne(id);
    const nextFloorId = dto.floor_id ?? row.floor_id;
    const nextName = dto.name ?? row.name;
    const floor = await this.floorRepo.findOne({ where: { id: nextFloorId } });
    if (!floor || floor.branch_id !== row.branch_id) {
      throw new NotFoundException(
        `Floor ${nextFloorId} not found for this branch`,
      );
    }
    const dup = await this.repo.findOne({
      where: {
        branch_id: row.branch_id,
        floor_id: nextFloorId,
        name: nextName,
        is_archived: false,
      },
    });
    if (dup && dup.id !== id) {
      throw new ConflictException(
        `Hall name "${nextName}" already exists on this floor`,
      );
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null): Promise<Hall> {
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
