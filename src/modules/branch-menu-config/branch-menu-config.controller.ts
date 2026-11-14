import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchMenuConfigService } from './branch-menu-config.service';
import { UpsertBranchMenuConfigDto } from './dto/upsert-branch-menu-config.dto';
import { QueryBranchMenuConfigDto } from './dto/query-branch-menu-config.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('branch-menu-config')
@Controller('branch-menu-config')
export class BranchMenuConfigController {
  constructor(
    private readonly branchMenuConfigService: BranchMenuConfigService,
    private readonly access: TenantAccessService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create or update branch menu config row' })
  async upsert(@Body() dto: UpsertBranchMenuConfigDto, @CurrentUser() user: RequestUser) {
    const branch = await this.access.assertBranch(user, dto.branch_id);
    await this.access.assertMenuItem(user, dto.item_id);
    dto.restaurant_id = branch.restaurant_id;
    return this.branchMenuConfigService.upsert(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List branch menu config rows' })
  async findAll(@Query() query: QueryBranchMenuConfigDto, @CurrentUser() user: RequestUser) {
    query.restaurant_id = this.access.scopeRestaurant(user, query.restaurant_id);
    query.branch_id = await this.access.resolveBranchFilter(user, query.branch_id);
    if (query.item_id != null) await this.access.assertMenuItem(user, query.item_id);
    return this.branchMenuConfigService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch menu config by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertBranchMenuConfig(user, id);
    return this.branchMenuConfigService.findOne(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive branch menu config' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertBranchMenuConfig(user, id);
    return this.branchMenuConfigService.archive(id);
  }
}
