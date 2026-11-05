import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { BranchSettingsModule } from '../branch-settings/branch-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, Restaurant]),
    BranchSettingsModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [TypeOrmModule, BranchesService],
})
export class BranchesModule {}
