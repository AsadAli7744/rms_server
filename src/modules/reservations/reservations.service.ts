import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Branch } from '../branches/entities/branch.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly repo: Repository<Reservation>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(
    branchId: number,
    dto: CreateReservationDto,
    actorId?: number | null,
  ): Promise<Reservation> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
    const row = this.repo.create({
      restaurant_id: branch.restaurant_id,
      branch_id: branchId,
      customer_id: dto.customer_id ?? null,
      customer_name: dto.customer_name,
      customer_phone: dto.customer_phone,
      customer_email: dto.customer_email ?? null,
      reservation_date: dto.reservation_date,
      reservation_time: dto.reservation_time.length === 5 ? `${dto.reservation_time}:00` : dto.reservation_time,
      guest_count: dto.guest_count,
      table_id: dto.table_id ?? null,
      special_request: dto.special_request ?? null,
      notes: dto.notes ?? null,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.repo.save(row);
  }

  async listByBranch(
    branchId: number,
    query: QueryReservationDto,
  ): Promise<{
    data: Reservation[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.assertBranch(branchId);
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.repo
      .createQueryBuilder('r')
      .where('r.branch_id = :bid', { bid: branchId });
    if (!query.include_archived) {
      qb.andWhere('r.is_archived = false');
    }
    if (query.date_from) {
      qb.andWhere('r.reservation_date >= :df', { df: query.date_from });
    }
    if (query.date_to) {
      qb.andWhere('r.reservation_date <= :dt', { dt: query.date_to });
    }
    qb.orderBy('r.reservation_date', 'ASC').addOrderBy('r.reservation_time', 'ASC');
    qb.skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Reservation> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return row;
  }

  async update(
    id: number,
    dto: UpdateReservationDto,
    actorId?: number | null,
  ): Promise<Reservation> {
    const row = await this.findOne(id);
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.repo.save(row);
  }

  async archive(id: number, actorId?: number | null): Promise<Reservation> {
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
