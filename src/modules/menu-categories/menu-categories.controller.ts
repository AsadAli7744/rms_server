import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuCategoriesService } from './menu-categories.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { QueryMenuCategoryDto } from './dto/query-menu-category.dto';

@ApiTags('menu-categories')
@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create menu category' })
  create(@Body() dto: CreateMenuCategoryDto) {
    return this.menuCategoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List menu categories' })
  findAll(@Query() query: QueryMenuCategoryDto) {
    return this.menuCategoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu category' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update menu category' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.menuCategoriesService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive menu category' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.menuCategoriesService.archive(id);
  }
}
