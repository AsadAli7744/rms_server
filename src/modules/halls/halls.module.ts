import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hall } from './entities/hall.entity';
import { Floor } from '../floors/entities/floor.entity';
import { Branch } from '../branches/entities/branch.entity';
import { HallsService } from './halls.service';
import { HallsBranchController, HallsController } from './halls.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, Floor, Branch])],
  controllers: [HallsBranchController, HallsController],
  providers: [HallsService],
  exports: [HallsService, TypeOrmModule],
})
export class HallsModule {}
