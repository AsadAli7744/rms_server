import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchOperatingHour } from './entities/branch-operating-hour.entity';
import { Branch } from '../branches/entities/branch.entity';
import { ReplaceOperatingHoursDto } from './dto/replace-operating-hours.dto';

@Injectable()
export class BranchOperatingHoursService {
  constructor(
    @InjectRepository(BranchOperatingHour)
    private readonly repo: Repository<BranchOperatingHour>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async listByBranch(branchId: number): Promise<BranchOperatingHour[]> {
    await this.assertBranch(branchId);
    return this.repo.find({
      where: { branch_id: branchId, is_archived: false },
      order: { day_of_week: 'ASC' },
    });
  }

  async replace(
    branchId: number,
    dto: ReplaceOperatingHoursDto,
    actorId?: number | null,
  ): Promise<BranchOperatingHour[]> {
    await this.assertBranch(branchId);
    await this.repo.manager.transaction(async (em) => {
      await em.delete(BranchOperatingHour, { branch_id: branchId });
      const rows = dto.hours.map((h) =>
        em.create(BranchOperatingHour, {
          branch_id: branchId,
          day_of_week: h.day_of_week,
          open_time: h.is_closed ? null : h.open_time ?? null,
          close_time: h.is_closed ? null : h.close_time ?? null,
          is_closed: h.is_closed ?? false,
          supports_pickup: h.supports_pickup ?? true,
          supports_delivery: h.supports_delivery ?? true,
          supports_dine_in: h.supports_dine_in ?? true,
          created_by: actorId ?? null,
          updated_by: actorId ?? null,
        }),
      );
      await em.save(BranchOperatingHour, rows);
    });
    return this.listByBranch(branchId);
  }

  private async assertBranch(branchId: number): Promise<void> {
    const ok = await this.branchRepo.exist({ where: { id: branchId } });
    if (!ok) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
  }
}
