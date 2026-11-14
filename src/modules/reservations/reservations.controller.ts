import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('reservations')
@Controller('branches')
export class ReservationsBranchController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':branchId/reservations')
  @ApiOperation({ summary: 'List reservations for branch' })
  async list(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query() query: QueryReservationDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.reservationsService.listByBranch(branchId, query);
  }

  @Post(':branchId/reservations')
  @ApiOperation({ summary: 'Create reservation' })
  async create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.reservationsService.create(branchId, dto);
  }
}

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertReservation(user, id);
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reservation (status, table, notes)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertReservation(user, id);
    if (dto.table_id != null) await this.access.assertTable(user, dto.table_id);
    return this.reservationsService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive reservation' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertReservation(user, id);
    return this.reservationsService.archive(id);
  }
}
