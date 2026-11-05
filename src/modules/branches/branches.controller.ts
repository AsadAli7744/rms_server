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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchDto } from './dto/query-branch.dto';

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List branches (filter by restaurant_id recommended)' })
  findAll(@Query() query: QueryBranchDto) {
    return this.branchesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive branch' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.archive(id);
  }
}
