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

@ApiTags('reservations')
@Controller('branches')
export class ReservationsBranchController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get(':branchId/reservations')
  @ApiOperation({ summary: 'List reservations for branch' })
  list(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query() query: QueryReservationDto,
  ) {
    return this.reservationsService.listByBranch(branchId, query);
  }

  @Post(':branchId/reservations')
  @ApiOperation({ summary: 'Create reservation' })
  create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(branchId, dto);
  }
}

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reservation (status, table, notes)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive reservation' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.archive(id);
  }
}
