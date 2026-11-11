import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRole } from '../enums/user-role.enum';
import { RequestUser } from '../decorators/current-user.decorator';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const roleHeader = request.headers['x-user-role'];
    const restHeader = request.headers['x-restaurant-id'];
    const idHeader = request.headers['x-user-id'];

    let userId = idHeader ? Number(idHeader) : undefined;
    let userRole = roleHeader as UserRole;
    let restaurantId = restHeader ? Number(restHeader) : undefined;

    // Parse Authorization header if present: Bearer rms-token-<id>-<role>-<timestamp>
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const match = token.match(/^rms-(?:demo-)?token-(\d+)-([a-z]+)/i);
      if (match) {
        if (!userId) userId = Number(match[1]);
        if (!userRole) userRole = match[2].toLowerCase() as UserRole;
      }
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Resolve user object
    const resolvedRole: UserRole = userRole || (requiredRoles && requiredRoles.length > 0 ? ('' as any) : UserRole.MANAGER);
    const resolvedUser: RequestUser = {
      id: userId || 1,
      role: resolvedRole,
      restaurant_id: restaurantId || 1,
    };

    request.user = resolvedUser;

    // Validate roles if required
    if (requiredRoles && requiredRoles.length > 0) {
      if (!userRole) {
        throw new UnauthorizedException('Authentication token or user role header is required for this operation');
      }
      const hasRole = requiredRoles.includes(userRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `Access forbidden: Role '${userRole}' does not have sufficient permissions to access this resource.`,
        );
      }
    }

    return true;
  }
}
