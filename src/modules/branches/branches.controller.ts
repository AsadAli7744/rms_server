import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchDto } from './dto/query-branch.dto';
import { TenantAuthGuard } from '../../common/guards/tenant-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('branches')
@Controller('branches')
@UseGuards(TenantAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() dto: CreateBranchDto, @CurrentUser() user: RequestUser) {
    if (user.role !== UserRole.ADMIN) {
      // Force non-admins to only create branches within their assigned restaurant
      dto.restaurant_id = user.restaurant_id;
    }
    return this.branchesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List branches (filter by restaurant_id recommended)' })
  findAll(@Query() query: QueryBranchDto, @CurrentUser() user: RequestUser) {
    if (user.role !== UserRole.ADMIN) {
      // Force non-admins to only see their restaurant's branches
      query.restaurant_id = user.restaurant_id;
    }
    return this.branchesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    const branch = await this.branchesService.findOne(id);
    if (user.role !== UserRole.ADMIN && branch.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: You cannot view branches belonging to other restaurants.');
    }
    return branch;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
    @CurrentUser() user: RequestUser,
  ) {
    const branch = await this.branchesService.findOne(id);
    if (user.role !== UserRole.ADMIN && branch.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: You cannot modify branches belonging to other restaurants.');
    }
    return this.branchesService.update(id, dto, user.id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Soft-archive branch' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    const branch = await this.branchesService.findOne(id);
    if (user.role !== UserRole.ADMIN && branch.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: You cannot archive branches belonging to other restaurants.');
    }
    return this.branchesService.archive(id, user.id);
  }
}
