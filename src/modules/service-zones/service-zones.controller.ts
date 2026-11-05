import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceZonesService } from './service-zones.service';
import { CreateServiceZoneDto } from './dto/create-service-zone.dto';
import { UpdateServiceZoneDto } from './dto/update-service-zone.dto';

@ApiTags('service-zones')
@Controller('branches')
export class ServiceZonesBranchController {
  constructor(private readonly serviceZonesService: ServiceZonesService) {}

  @Get(':branchId/service-zones')
  @ApiOperation({ summary: 'List delivery service zones for branch' })
  listByBranch(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.serviceZonesService.listByBranch(branchId);
  }

  @Post(':branchId/service-zones')
  @ApiOperation({ summary: 'Create service zone' })
  create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateServiceZoneDto,
  ) {
    return this.serviceZonesService.create(branchId, dto);
  }
}

@ApiTags('service-zones')
@Controller('service-zones')
export class ServiceZonesController {
  constructor(private readonly serviceZonesService: ServiceZonesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get service zone by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceZonesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service zone' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceZoneDto,
  ) {
    return this.serviceZonesService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive service zone' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.serviceZonesService.archive(id);
  }
}
