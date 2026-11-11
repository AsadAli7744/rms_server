import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export interface RequestUser {
  id: number;
  role: UserRole;
  restaurant_id: number;
  branch_id?: number | null;
  email?: string;
  name?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    return data ? user?.[data] : user;
  },
);
