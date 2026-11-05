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

@ApiTags('dining-tables')
@Controller('branches')
export class DiningTablesBranchController {
  constructor(private readonly diningTablesService: DiningTablesService) {}

  @Get(':branchId/tables')
  @ApiOperation({ summary: 'List dining tables for branch' })
  list(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.diningTablesService.listByBranch(branchId);
  }

  @Post(':branchId/tables')
  @ApiOperation({ summary: 'Create dining table' })
  create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateDiningTableDto,
  ) {
    return this.diningTablesService.create(branchId, dto);
  }
}

@ApiTags('dining-tables')
@Controller('tables')
export class DiningTablesController {
  constructor(private readonly diningTablesService: DiningTablesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get dining table by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.diningTablesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dining table' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiningTableDto,
  ) {
    return this.diningTablesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update dining table status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTableStatusDto,
  ) {
    return this.diningTablesService.updateStatus(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive dining table' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.diningTablesService.archive(id);
  }
}
