import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchMenuConfig } from './entities/branch-menu-config.entity';
import { Branch } from '../branches/entities/branch.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { BranchMenuConfigService } from './branch-menu-config.service';
import { BranchMenuConfigController } from './branch-menu-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BranchMenuConfig, Branch, MenuItem])],
  controllers: [BranchMenuConfigController],
  providers: [BranchMenuConfigService],
  exports: [BranchMenuConfigService, TypeOrmModule],
})
export class BranchMenuConfigModule {}
