import { UserRole } from '../enums/user-role.enum';

export interface UserRoleDefinition {
  key: UserRole;
  title: string;
  description: string;
  scope: 'global' | 'tenant' | 'branch';
  defaultLandingPath: string;
  permissions: string[];
}

export const USER_ROLE_CONFIGS: Record<UserRole, UserRoleDefinition> = {
  [UserRole.ADMIN]: {
    key: UserRole.ADMIN,
    title: 'SaaS Platform Owner',
    description: 'System-wide tenant administration.',
    scope: 'global',
    defaultLandingPath: '/tenants',
    permissions: [
      'tenants:create',
      'tenants:read',
      'tenants:update',
      'tenants:archive',
      'branches:create',
      'branches:read',
      'branches:update',
      'branches:archive',
      'users:manage-all',
      'platform:analytics',
    ],
  },
  [UserRole.MANAGER]: {
    key: UserRole.MANAGER,
    title: 'Restaurant Owner / Manager',
    description: 'Branch operations, sales reports, floor management, menu pricing, and discounts.',
    scope: 'tenant',
    defaultLandingPath: '/branches',
    permissions: [
      'branches:manage',
      'menu:manage',
      'floors:manage',
      'tables:manage',
      'reports:item-sales',
      'discounts:apply',
      'orders:manage',
    ],
  },
  [UserRole.CASHIER]: {
    key: UserRole.CASHIER,
    title: 'Cashier Staff',
    description: 'Point of sale billing, 1-order-per-table active queue enforcement, and payment settlement.',
    scope: 'branch',
    defaultLandingPath: '/branches',
    permissions: [
      'orders:create',
      'orders:read',
      'orders:queue',
      'payments:settle',
      'discounts:apply',
      'tables:read',
    ],
  },
  [UserRole.KITCHEN]: {
    key: UserRole.KITCHEN,
    title: 'Kitchen Staff',
    description: 'Kitchen Display System (KDS), real-time ticket progression, and thermal receipt printing.',
    scope: 'branch',
    defaultLandingPath: '/branches',
    permissions: [
      'kds:view',
      'tickets:update-status',
      'thermal-print:execute',
      'live-events:subscribe',
    ],
  },
  [UserRole.WAITER]: {
    key: UserRole.WAITER,
    title: 'Floor Waiter',
    description: 'Table order creation and floor guest assistance.',
    scope: 'branch',
    defaultLandingPath: '/branches',
    permissions: [
      'orders:create',
      'tables:view',
      'menu:view',
    ],
  },
};
