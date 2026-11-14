import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly access: TenantAccessService,
  ) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'User login (Kitchen, Cashier, Manager, Admin)' })
  login(@Body() dto: LoginUserDto) {
    return this.usersService.login(dto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create user (Cashier, Kitchen, Waiter, Manager)' })
  create(@Body() dto: CreateUserDto, @CurrentUser() user: RequestUser) {
    if (user.role !== UserRole.ADMIN) {
      if (dto.role === UserRole.ADMIN) {
        throw new ForbiddenException('Access denied: Only SaaS Platform Owners can create Admin accounts.');
      }
      // Force non-admins to create users strictly for their restaurant
      dto.restaurant_id = user.restaurant_id;
    }
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users with pagination and role filters (Tenant isolated)' })
  findAll(@Query() query: QueryUserDto, @CurrentUser() user: RequestUser) {
    if (user.role !== UserRole.ADMIN) {
      query.restaurant_id = user.restaurant_id;
    }
    if (this.access.locksToAssignedBranch(user)) {
      if (user.branch_id == null) {
        throw new ForbiddenException('This account is not assigned to a branch.');
      }
      query.branch_id = user.branch_id;
    }
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    const targetUser = await this.usersService.findOne(id);
    if (user.role !== UserRole.ADMIN && targetUser.restaurant_id !== user.restaurant_id) {
      throw new ForbiddenException('Access denied: You cannot view user accounts of other restaurants.');
    }
    if (this.access.locksToAssignedBranch(user) && targetUser.branch_id !== user.branch_id) {
      throw new ForbiddenException('Access denied: this record belongs to another branch.');
    }
    return targetUser;
  }
}
