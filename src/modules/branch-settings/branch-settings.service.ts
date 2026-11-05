import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchSettings } from './entities/branch-settings.entity';
import { UpsertBranchSettingsDto } from './dto/upsert-branch-settings.dto';
import { Branch } from '../branches/entities/branch.entity';

@Injectable()
export class BranchSettingsService {
  constructor(
    @InjectRepository(BranchSettings)
    private readonly repo: Repository<BranchSettings>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async ensureDefaultForBranch(branchId: number): Promise<BranchSettings> {
    const existing = await this.repo.findOne({ where: { branch_id: branchId } });
    if (existing) {
      return existing;
    }
    const row = this.repo.create({
      branch_id: branchId,
      order_number_prefix: null,
      receipt_footer: null,
      notification_email: null,
      settings_json: null,
    });
    return this.repo.save(row);
  }

  async getByBranchId(branchId: number): Promise<BranchSettings> {
    await this.assertBranchExists(branchId);
    let row = await this.repo.findOne({ where: { branch_id: branchId } });
    if (!row) {
      row = await this.ensureDefaultForBranch(branchId);
    }
    return row;
  }

  async upsert(
    branchId: number,
    dto: UpsertBranchSettingsDto,
    actorId?: number | null,
  ): Promise<BranchSettings> {
    await this.assertBranchExists(branchId);
    let row = await this.repo.findOne({ where: { branch_id: branchId } });
    if (!row) {
      row = this.repo.create({ branch_id: branchId });
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  private async assertBranchExists(branchId: number): Promise<void> {
    const ok = await this.branchRepo.exist({ where: { id: branchId } });
    if (!ok) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
  }
}
