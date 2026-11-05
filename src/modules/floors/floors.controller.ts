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
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';

@ApiTags('floors')
@Controller('branches')
export class FloorsBranchController {
  constructor(private readonly floorsService: FloorsService) {}

  @Get(':branchId/floors')
  @ApiOperation({ summary: 'List floors for branch' })
  list(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query() query: QueryFloorDto,
  ) {
    return this.floorsService.listByBranch(branchId, query);
  }

  @Post(':branchId/floors')
  @ApiOperation({ summary: 'Create floor' })
  create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateFloorDto,
  ) {
    return this.floorsService.create(branchId, dto);
  }
}

@ApiTags('floors')
@Controller('floors')
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get floor by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.floorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update floor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFloorDto,
  ) {
    return this.floorsService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive floor' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.floorsService.archive(id);
  }
}
