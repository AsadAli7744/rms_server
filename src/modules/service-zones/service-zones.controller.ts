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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('service-zones')
@Controller('branches')
export class ServiceZonesBranchController {
  constructor(
    private readonly serviceZonesService: ServiceZonesService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':branchId/service-zones')
  @ApiOperation({ summary: 'List delivery service zones for branch' })
  async listByBranch(
    @Param('branchId', ParseIntPipe) branchId: number,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.serviceZonesService.listByBranch(branchId);
  }

  @Post(':branchId/service-zones')
  @ApiOperation({ summary: 'Create service zone' })
  async create(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateServiceZoneDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertBranch(user, branchId);
    return this.serviceZonesService.create(branchId, dto);
  }
}

@ApiTags('service-zones')
@Controller('service-zones')
export class ServiceZonesController {
  constructor(
    private readonly serviceZonesService: ServiceZonesService,
    private readonly access: TenantAccessService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get service zone by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertServiceZone(user, id);
    return this.serviceZonesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service zone' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceZoneDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.access.assertServiceZone(user, id);
    return this.serviceZonesService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive service zone' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    await this.access.assertServiceZone(user, id);
    return this.serviceZonesService.archive(id);
  }
}
