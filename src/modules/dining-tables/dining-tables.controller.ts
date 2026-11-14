import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DiningTablesService } from './dining-tables.service';
import { CreateDiningTableDto } from './dto/create-dining-table.dto';
import { UpdateDiningTableDto } from './dto/update-dining-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('dining-tables')
@Controller('branches')
export class DiningTablesBranchController {
  constructor(
    private readonly diningTablesService: DiningTablesService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':branchId/tables')
  @ApiOperation({ summary: 'List dining tables for branch' })
  async list(@Param('branchId', ParseIntPipe) branchId: number, @CurrentUser() user: RequestUser) {
    await this.access.assertBranch(user, branchId);
    return this.diningTablesService.listByBranch(branchId);
  }

  @Post(':branchId/tables')
  @ApiOperation({ summary: 'Create dining table' })
  async create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateDiningTableDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.diningTablesService.create(branchId, dto);
  }
}

@ApiTags('dining-tables')
@Controller('tables')
export class DiningTablesController {
  constructor(
    private readonly diningTablesService: DiningTablesService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get dining table by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertTable(user, id);
    return this.diningTablesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dining table' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiningTableDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertTable(user, id);
    return this.diningTablesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update dining table status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTableStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertTable(user, id);
    return this.diningTablesService.updateStatus(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive dining table' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertTable(user, id);
    return this.diningTablesService.archive(id);
  }
}
