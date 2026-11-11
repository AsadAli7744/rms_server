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
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('branches')
@Controller('branches')
@UseGuards(TenantAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create branch (SaaS Platform Owner / Admin only)' })
  create(@Body() dto: CreateBranchDto, @CurrentUser() user: RequestUser) {
    return this.branchesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List branches (Tenant isolated for managers, all for admin)' })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update branch (SaaS Platform Owner / Admin only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.branchesService.update(id, dto, user.id);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft-archive branch (SaaS Platform Owner / Admin only)' })
  async archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.branchesService.archive(id, user.id);
  }
}
