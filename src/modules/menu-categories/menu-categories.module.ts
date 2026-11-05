import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoriesController } from './menu-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuCategory, Restaurant])],
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService],
  exports: [MenuCategoriesService, TypeOrmModule],
})
export class MenuCategoriesModule {}
