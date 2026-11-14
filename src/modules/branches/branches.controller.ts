import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchDto } from './dto/query-branch.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly access: TenantAccessService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create branch (SaaS Platform Owner / Admin only)' })
  create(@Body() dto: CreateBranchDto, @CurrentUser() user: RequestUser) {
    return this.branchesService.create(dto, user.id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get or create the signed-in restaurant branch' })
  async getDefault(@CurrentUser() user: RequestUser) {
    if (!user?.restaurant_id) {
      throw new ForbiddenException('No restaurant is assigned to this account.');
    }
    const branch = await this.branchesService.ensureDefaultBranch(
      user.restaurant_id,
      user.id,
    );
    await this.branchesService.attachUserToRestaurantBranch(user.id, branch);
    return branch;
  }

  @Public()
  @Get(':id/ordering')
  @ApiOperation({ summary: 'Public QR menu for a branch (items and currency)' })
  orderingMenu(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.getOrderingMenu(id);
  }

  @Get()
  @ApiOperation({ summary: 'List branches (Tenant isolated for managers, all for admin)' })
  findAll(@Query() query: QueryBranchDto, @CurrentUser() user: RequestUser) {
    if (user.role !== UserRole.ADMIN) {
      query.restaurant_id = user.restaurant_id;
    }
    if (this.access.locksToAssignedBranch(user)) {
      if (user.branch_id == null) {
        throw new ForbiddenException('This account is not assigned to a branch.');
      }
      query.id = user.branch_id;
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
