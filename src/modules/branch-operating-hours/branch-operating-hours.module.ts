import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchOperatingHour } from './entities/branch-operating-hour.entity';
import { Branch } from '../branches/entities/branch.entity';
import { BranchOperatingHoursService } from './branch-operating-hours.service';
import { BranchOperatingHoursController } from './branch-operating-hours.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BranchOperatingHour, Branch])],
  controllers: [BranchOperatingHoursController],
  providers: [BranchOperatingHoursService],
  exports: [BranchOperatingHoursService, TypeOrmModule],
})
export class BranchOperatingHoursModule {}
