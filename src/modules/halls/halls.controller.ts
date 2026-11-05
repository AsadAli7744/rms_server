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
import { HallsService } from './halls.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { QueryHallDto } from './dto/query-hall.dto';

@ApiTags('halls')
@Controller('branches')
export class HallsBranchController {
  constructor(private readonly hallsService: HallsService) {}

  @Get(':branchId/halls')
  @ApiOperation({ summary: 'List halls for branch' })
  list(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query() query: QueryHallDto,
  ) {
    return this.hallsService.listByBranch(branchId, query);
  }

  @Post(':branchId/halls')
  @ApiOperation({ summary: 'Create hall' })
  create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateHallDto,
  ) {
    return this.hallsService.create(branchId, dto);
  }
}

@ApiTags('halls')
@Controller('halls')
export class HallsController {
  constructor(private readonly hallsService: HallsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get hall by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hallsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update hall' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHallDto,
  ) {
    return this.hallsService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive hall' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.hallsService.archive(id);
  }
}
