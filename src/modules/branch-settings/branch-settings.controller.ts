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

@ApiTags('branch-settings')
@Controller('branches')
export class BranchSettingsController {
  constructor(private readonly branchSettingsService: BranchSettingsService) {}

  @Get(':branchId/settings')
  @ApiOperation({ summary: 'Get branch settings (creates defaults if missing)' })
  getByBranch(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.branchSettingsService.getByBranchId(branchId);
  }

  @Patch(':branchId/settings')
  @ApiOperation({ summary: 'Upsert branch settings' })
  upsert(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: UpsertBranchSettingsDto,
  ) {
    return this.branchSettingsService.upsert(branchId, dto);
  }
}
