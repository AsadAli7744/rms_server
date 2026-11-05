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
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create restaurant' })
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List restaurants (paginated)' })
  findAll(@Query() query: QueryRestaurantDto) {
    return this.restaurantsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update restaurant' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive restaurant' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.archive(id);
  }
}
