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

@ApiTags('branch-menu-config')
@Controller('branch-menu-config')
export class BranchMenuConfigController {
  constructor(private readonly branchMenuConfigService: BranchMenuConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update branch menu config row' })
  upsert(@Body() dto: UpsertBranchMenuConfigDto) {
    return this.branchMenuConfigService.upsert(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List branch menu config rows' })
  findAll(@Query() query: QueryBranchMenuConfigDto) {
    return this.branchMenuConfigService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch menu config by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchMenuConfigService.findOne(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive branch menu config' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.branchMenuConfigService.archive(id);
  }
}
