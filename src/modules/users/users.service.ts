import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { buildPaginatedResponse } from '../../common/shared/utils/pagination.util';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Branch } from '../branches/entities/branch.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: dto.restaurant_id, is_archived: false },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${dto.restaurant_id} not found`);
    }

    if (dto.branch_id != null) {
      const branch = await this.branchRepo.findOne({
        where: { id: dto.branch_id, is_archived: false },
      });
      if (!branch || branch.restaurant_id !== dto.restaurant_id) {
        throw new BadRequestException(
          `Branch #${dto.branch_id} does not belong to restaurant #${dto.restaurant_id}`,
        );
      }
    }

    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase(), is_archived: false },
    });
    if (existing) {
      throw new ConflictException(
        `User with email "${dto.email}" already exists. Each email must belong to one user only.`,
      );
    }

    const user = this.userRepo.create({
      restaurant_id: dto.restaurant_id,
      branch_id: dto.branch_id ?? null,
      name: dto.name,
      email: dto.email.toLowerCase(),
      role: dto.role,
      password_hash: dto.password ?? null,
      is_active: true,
    });
    return this.userRepo.save(user);
  }

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .leftJoinAndSelect('user.branch', 'branch')
      .where('user.is_archived = :isArchived', { isArchived: false });

    if (query.restaurant_id != null) {
      qb.andWhere('user.restaurant_id = :restaurantId', {
        restaurantId: query.restaurant_id,
      });
    }

    if (query.branch_id != null) {
      qb.andWhere('user.branch_id = :branchId', { branchId: query.branch_id });
    }

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(user.name) LIKE :s OR LOWER(user.email) LIKE :s)',
        { s: `%${query.search.toLowerCase()}%` },
      );
    }

    qb.orderBy('user.id', 'ASC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id, is_archived: false },
      relations: ['restaurant', 'branch'],
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async login(dto: LoginUserDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase(), is_active: true, is_archived: false },
      relations: ['restaurant', 'branch'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or user is inactive');
    }
    if (user.password_hash && dto.password && user.password_hash !== dto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = `rms-token-${user.id}-${user.role}-${Date.now()}`;
    return { user, token };
  }
}
