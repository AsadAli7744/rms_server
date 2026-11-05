import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiningTable } from './entities/dining-table.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Floor } from '../floors/entities/floor.entity';
import { Hall } from '../halls/entities/hall.entity';
import { DiningTablesService } from './dining-tables.service';
import {
  DiningTablesBranchController,
  DiningTablesController,
} from './dining-tables.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiningTable, Branch, Floor, Hall])],
  controllers: [DiningTablesBranchController, DiningTablesController],
  providers: [DiningTablesService],
  exports: [DiningTablesService, TypeOrmModule],
})
export class DiningTablesModule {}
