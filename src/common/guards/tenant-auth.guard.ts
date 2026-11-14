import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRole } from '../enums/user-role.enum';
import { RequestUser } from '../decorators/current-user.decorator';
import { User } from '../../modules/users/entities/user.entity';
import { Restaurant } from '../../modules/restaurants/entities/restaurant.entity';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = await this.resolveUser(request);
    request.user = user ?? undefined;

    if (isPublic) {
      return true;
    }

    if (!user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access forbidden: Role '${user.role}' does not have sufficient permissions to access this resource.`,
      );
    }

    return true;
  }

  /**
   * Identity comes from the user row behind the token.
   * A non-admin cannot pick another restaurant with a header.
   * A platform admin may select a tenant with x-restaurant-id after that restaurant exists.
   */
  private async resolveUser(request: {
    headers: Record<string, string | string[] | undefined>;
    query?: Record<string, unknown>;
  }): Promise<RequestUser | null> {
    const token = this.readToken(request);
    if (!token) return null;

    const match = token.match(/^rms-token-(\d+)-/i);
    if (!match) return null;

    const user = await this.userRepo.findOne({
      where: { id: Number(match[1]), is_active: true, is_archived: false },
    });
    if (!user) return null;

    let restaurantId = user.restaurant_id;
    if (user.role === UserRole.ADMIN) {
      restaurantId = await this.adminRestaurant(request, restaurantId);
    }

    return {
      id: user.id,
      role: user.role,
      restaurant_id: restaurantId,
      branch_id: user.branch_id,
      email: user.email,
      name: user.name,
    };
  }

  private async adminRestaurant(
    request: { headers: Record<string, string | string[] | undefined> },
    fallback: number,
  ): Promise<number> {
    const header = request.headers['x-restaurant-id'];
    const raw = Array.isArray(header) ? header[0] : header;
    const requested = raw ? Number(raw) : NaN;
    if (!Number.isInteger(requested) || requested <= 0) return fallback;
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: requested, is_archived: false },
    });
    return restaurant ? restaurant.id : fallback;
  }

  private readToken(request: {
    headers: Record<string, string | string[] | undefined>;
    query?: Record<string, unknown>;
  }): string | null {
    const authHeader = request.headers['authorization'];
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (headerValue && headerValue.startsWith('Bearer ')) {
      return headerValue.substring(7).trim();
    }
    const queryToken = request.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim()) {
      return queryToken.trim();
    }
    return null;
  }
}
