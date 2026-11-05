import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ItemSalesQueryDto, SalesSummaryQueryDto } from './dto/reports-query.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('item-sales')
  @ApiOperation({ summary: 'Get Item Sales report with date filter, item dropdown filter, quantities and period grouping' })
  getItemSales(@Query() query: ItemSalesQueryDto) {
    return this.reportsService.getItemSales(query);
  }

  @Get('sales-summary')
  @ApiOperation({ summary: 'Get Sales summary with total discounts given for specific date or date range' })
  getSalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.reportsService.getSalesSummary(query);
  }
}
