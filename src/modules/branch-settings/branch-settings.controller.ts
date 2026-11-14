import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchSettingsService } from './branch-settings.service';
import { UpsertBranchSettingsDto } from './dto/upsert-branch-settings.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('branch-settings')
@Controller('branches')
export class BranchSettingsController {
  constructor(
    private readonly branchSettingsService: BranchSettingsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':branchId/settings')
  @ApiOperation({ summary: 'Get branch settings (creates defaults if missing)' })
  async getByBranch(
    @Param('branchId', ParseIntPipe) branchId: number,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.branchSettingsService.getByBranchId(branchId);
  }

  @Patch(':branchId/settings')
  @ApiOperation({ summary: 'Upsert branch settings' })
  async upsert(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: UpsertBranchSettingsDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.branchSettingsService.upsert(branchId, dto);
  }
}
