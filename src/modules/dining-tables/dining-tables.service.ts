import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiningTable } from './entities/dining-table.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Floor } from '../floors/entities/floor.entity';
import { Hall } from '../halls/entities/hall.entity';
import { CreateDiningTableDto } from './dto/create-dining-table.dto';
import { UpdateDiningTableDto } from './dto/update-dining-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';

@Injectable()
export class DiningTablesService {
  constructor(
    @InjectRepository(DiningTable)
    private readonly repo: Repository<DiningTable>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Floor)
    private readonly floorRepo: Repository<Floor>,
    @InjectRepository(Hall)
    private readonly hallRepo: Repository<Hall>,
  ) {}

  async listByBranch(branchId: number): Promise<DiningTable[]> {
    await this.assertBranch(branchId);
    return this.repo.find({
      where: { branch_id: branchId, is_archived: false },
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  async create(
    branchId: number,
    dto: CreateDiningTableDto,
    actorId?: number | null,
  ): Promise<DiningTable> {
    await this.assertBranch(branchId);
    const exists = await this.repo.exist({
      where: { branch_id: branchId, code: dto.code, is_archived: false },
    });
    if (exists) {
      throw new ConflictException(
        `Table code "${dto.code}" already exists for this branch`,
      );
    }
    const { floor_id, hall_id } = await this.resolveSeating(
      branchId,
      dto.floor_id,
      dto.hall_id,
    );
    const row = this.repo.create({
      branch_id: branchId,
      code: dto.code,
      name: dto.name ?? null,
      floor: dto.floor ?? null,
      section: dto.section ?? null,
      floor_id,
      hall_id,
      seating_capacity: dto.seating_capacity ?? 4,
      status: dto.status,
      qr_code: dto.qr_code ?? null,
      sort_order: dto.sort_order ?? null,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async findOne(id: number): Promise<DiningTable> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Dining table ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateDiningTableDto,
    actorId?: number | null,
  ): Promise<DiningTable> {
    const row = await this.findOne(id);
    if (dto.floor_id !== undefined || dto.hall_id !== undefined) {
      const { floor_id, hall_id } = await this.resolveSeating(
        row.branch_id,
        dto.floor_id !== undefined ? dto.floor_id : row.floor_id,
        dto.hall_id !== undefined ? dto.hall_id : row.hall_id,
      );
      row.floor_id = floor_id;
      row.hall_id = hall_id;
    }
    if (dto.code && dto.code !== row.code) {
      const exists = await this.repo.exist({
        where: { branch_id: row.branch_id, code: dto.code, is_archived: false },
      });
      if (exists) {
        throw new ConflictException(
          `Table code "${dto.code}" already exists for this branch`,
        );
      }
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async updateStatus(
    id: number,
    dto: UpdateTableStatusDto,
    actorId?: number | null,
  ): Promise<DiningTable> {
    const row = await this.findOne(id);
    row.status = dto.status;
    row.updated_by = actorId ?? null;
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null): Promise<DiningTable> {
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

  private async resolveSeating(
    branchId: number,
    floorId?: number | null,
    hallId?: number | null,
  ): Promise<{ floor_id: number | null; hall_id: number | null }> {
    if (hallId == null && floorId == null) {
      return { floor_id: null, hall_id: null };
    }
    if (hallId != null) {
      const hall = await this.hallRepo.findOne({ where: { id: hallId } });
      if (!hall || hall.branch_id !== branchId) {
        throw new BadRequestException(
          `Hall ${hallId} is not valid for branch ${branchId}`,
        );
      }
      return { floor_id: hall.floor_id, hall_id: hall.id };
    }
    const floor = await this.floorRepo.findOne({ where: { id: floorId! } });
    if (!floor || floor.branch_id !== branchId) {
      throw new BadRequestException(
        `Floor ${floorId} is not valid for branch ${branchId}`,
      );
    }
    return { floor_id: floor.id, hall_id: null };
  }
}
