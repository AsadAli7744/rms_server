import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceZone } from './entities/service-zone.entity';
import { Branch } from '../branches/entities/branch.entity';
import { ServiceZonesService } from './service-zones.service';
import {
  ServiceZonesBranchController,
  ServiceZonesController,
} from './service-zones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceZone, Branch])],
  controllers: [ServiceZonesBranchController, ServiceZonesController],
  providers: [ServiceZonesService],
  exports: [ServiceZonesService, TypeOrmModule],
})
export class ServiceZonesModule {}
