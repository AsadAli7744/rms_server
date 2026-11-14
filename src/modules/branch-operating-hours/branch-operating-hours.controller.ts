import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchOperatingHoursService } from './branch-operating-hours.service';
import { ReplaceOperatingHoursDto } from './dto/replace-operating-hours.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('branch-operating-hours')
@Controller('branches')
export class BranchOperatingHoursController {
  constructor(
    private readonly branchOperatingHoursService: BranchOperatingHoursService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':branchId/operating-hours')
  @ApiOperation({ summary: 'List weekly operating hours for branch' })
  async list(
    @Param('branchId', ParseIntPipe) branchId: number,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.branchOperatingHoursService.listByBranch(branchId);
  }

  @Put(':branchId/operating-hours')
  @ApiOperation({ summary: 'Replace all operating hours for branch' })
  async replace(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: ReplaceOperatingHoursDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.branchOperatingHoursService.replace(branchId, dto);
  }
}
