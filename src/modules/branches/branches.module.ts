import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { BranchSettingsModule } from '../branch-settings/branch-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, Restaurant, User, MenuItem]),
    BranchSettingsModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [TypeOrmModule, BranchesService],
})
export class BranchesModule {}
