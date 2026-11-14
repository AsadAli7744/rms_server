import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ItemSalesQueryDto, SalesSummaryQueryDto } from './dto/reports-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly access: TenantAccessService,
  ) {}

  @Get('item-sales')
  @ApiOperation({ summary: 'Get Item Sales report with date filter, item dropdown filter, quantities and period grouping' })
  async getItemSales(@Query() query: ItemSalesQueryDto, @CurrentUser() user: RequestUser) {
    const branch = await this.access.assertBranch(user, query.branch_id);
    query.restaurant_id = branch.restaurant_id;
    return this.reportsService.getItemSales(query);
  }

  @Get('sales-summary')
  @ApiOperation({ summary: 'Get Sales summary with total discounts given for specific date or date range' })
  async getSalesSummary(@Query() query: SalesSummaryQueryDto, @CurrentUser() user: RequestUser) {
    const branch = await this.access.assertBranch(user, query.branch_id);
    query.restaurant_id = branch.restaurant_id;
    return this.reportsService.getSalesSummary(query);
  }
}
