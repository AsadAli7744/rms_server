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

@ApiTags('branch-operating-hours')
@Controller('branches')
export class BranchOperatingHoursController {
  constructor(
    private readonly branchOperatingHoursService: BranchOperatingHoursService,
  ) {}

  @Get(':branchId/operating-hours')
  @ApiOperation({ summary: 'List weekly operating hours for branch' })
  list(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.branchOperatingHoursService.listByBranch(branchId);
  }

  @Put(':branchId/operating-hours')
  @ApiOperation({ summary: 'Replace all operating hours for branch' })
  replace(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: ReplaceOperatingHoursDto,
  ) {
    return this.branchOperatingHoursService.replace(branchId, dto);
  }
}
