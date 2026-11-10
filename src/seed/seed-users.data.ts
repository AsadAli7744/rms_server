import { UserRole } from '../common/enums';

export interface SeedUserData {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  isBranchSpecific: boolean;
  description: string;
}

/**
 * Master seed users configuration with credentials.
 * Used by seed-users.ts and seed.ts.
 */
export const SEED_USERS: SeedUserData[] = [
  {
    name: 'SaaS Super Admin',
    email: 'admin@rms.com',
    role: UserRole.ADMIN,
    password: 'password123',
    isBranchSpecific: false,
    description: 'SaaS Platform Owner - Full tenant and infrastructure management',
  },
  {
    name: 'David Manager',
    email: 'manager@restaurant.com',
    role: UserRole.MANAGER,
    password: 'password123',
    isBranchSpecific: true,
    description: 'Restaurant Owner / Manager - Branch operations, tables & analytics',
  },
  {
    name: 'Sarah Cashier',
    email: 'cashier@restaurant.com',
    role: UserRole.CASHIER,
    password: 'password123',
    isBranchSpecific: true,
    description: 'Cashier Staff - POS orders, table queue & checkout',
  },
  {
    name: 'Chef Gordon',
    email: 'kitchen@restaurant.com',
    role: UserRole.KITCHEN,
    password: 'password123',
    isBranchSpecific: true,
    description: 'Kitchen Staff - Kitchen Display System (KDS) & thermal printing',
  },
  {
    name: 'Alex Waiter',
    email: 'waiter@restaurant.com',
    role: UserRole.WAITER,
    password: 'password123',
    isBranchSpecific: true,
    description: 'Floor Waiter - Table order assistance and mobile POS',
  },
];
