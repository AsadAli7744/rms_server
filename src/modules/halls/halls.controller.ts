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
import { HallsService } from './halls.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { QueryHallDto } from './dto/query-hall.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('halls')
@Controller('branches')
export class HallsBranchController {
  constructor(
    private readonly hallsService: HallsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':branchId/halls')
  @ApiOperation({ summary: 'List halls for branch' })
  async list(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query() query: QueryHallDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.hallsService.listByBranch(branchId, query);
  }

  @Post(':branchId/halls')
  @ApiOperation({ summary: 'Create hall' })
  async create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateHallDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.hallsService.create(branchId, dto);
  }
}

@ApiTags('halls')
@Controller('halls')
export class HallsController {
  constructor(
    private readonly hallsService: HallsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get hall by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertHall(user, id);
    return this.hallsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update hall' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHallDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertHall(user, id);
    return this.hallsService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive hall' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertHall(user, id);
    return this.hallsService.archive(id);
  }
}
