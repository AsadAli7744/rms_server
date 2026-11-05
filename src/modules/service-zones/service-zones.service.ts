import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceZone } from './entities/service-zone.entity';
import { Branch } from '../branches/entities/branch.entity';
import { CreateServiceZoneDto } from './dto/create-service-zone.dto';
import { UpdateServiceZoneDto } from './dto/update-service-zone.dto';

@Injectable()
export class ServiceZonesService {
  constructor(
    @InjectRepository(ServiceZone)
    private readonly repo: Repository<ServiceZone>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async listByBranch(branchId: number): Promise<ServiceZone[]> {
    await this.assertBranch(branchId);
    return this.repo.find({
      where: { branch_id: branchId, is_archived: false },
      order: { id: 'ASC' },
    });
  }

  async create(
    branchId: number,
    dto: CreateServiceZoneDto,
    actorId?: number | null,
  ): Promise<ServiceZone> {
    await this.assertBranch(branchId);
    const row = this.repo.create({
      branch_id: branchId,
      zone_name: dto.zone_name,
      zone_code: dto.zone_code ?? null,
      min_order_amount: dto.min_order_amount ?? null,
      delivery_fee: dto.delivery_fee,
      estimated_delivery_minutes: dto.estimated_delivery_minutes ?? 30,
      free_delivery_threshold: dto.free_delivery_threshold ?? null,
      is_active: dto.is_active ?? true,
      notes: dto.notes ?? null,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async findOne(id: number): Promise<ServiceZone> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Service zone ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateServiceZoneDto,
    actorId?: number | null,
  ): Promise<ServiceZone> {
    const row = await this.findOne(id);
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null): Promise<ServiceZone> {
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
