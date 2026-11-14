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
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('floors')
@Controller('branches')
export class FloorsBranchController {
  constructor(
    private readonly floorsService: FloorsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':branchId/floors')
  @ApiOperation({ summary: 'List floors for branch' })
  async list(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query() query: QueryFloorDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.floorsService.listByBranch(branchId, query);
  }

  @Post(':branchId/floors')
  @ApiOperation({ summary: 'Create floor' })
  async create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateFloorDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.floorsService.create(branchId, dto);
  }
}

@ApiTags('floors')
@Controller('floors')
export class FloorsController {
  constructor(
    private readonly floorsService: FloorsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get floor by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertFloor(user, id);
    return this.floorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update floor' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFloorDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertFloor(user, id);
    return this.floorsService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive floor' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertFloor(user, id);
    return this.floorsService.archive(id);
  }
}
