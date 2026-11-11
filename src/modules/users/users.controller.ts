import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { TenantAuthGuard } from '../../common/guards/tenant-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('users')
@Controller('users')
@UseGuards(TenantAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'User login (Kitchen, Cashier, Manager, Admin)' })
  login(@Body() dto: LoginUserDto) {
    return this.usersService.login(dto);
  }

  @Post()
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
      // Force non-admins to only see users of their own restaurant
      query.restaurant_id = user.restaurant_id;
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
    return targetUser;
  }
}
