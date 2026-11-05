import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchSettings } from './entities/branch-settings.entity';
import { Branch } from '../branches/entities/branch.entity';
import { BranchSettingsService } from './branch-settings.service';
import { BranchSettingsController } from './branch-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BranchSettings, Branch])],
  controllers: [BranchSettingsController],
  providers: [BranchSettingsService],
  exports: [BranchSettingsService, TypeOrmModule],
})
export class BranchSettingsModule {}
