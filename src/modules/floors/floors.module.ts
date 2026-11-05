import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Floor } from './entities/floor.entity';
import { Branch } from '../branches/entities/branch.entity';
import { FloorsService } from './floors.service';
import { FloorsBranchController, FloorsController } from './floors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Floor, Branch])],
  controllers: [FloorsBranchController, FloorsController],
  providers: [FloorsService],
  exports: [FloorsService, TypeOrmModule],
})
export class FloorsModule {}
