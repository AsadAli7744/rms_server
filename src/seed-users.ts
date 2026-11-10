import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { DataSource } from 'typeorm';
import { Restaurant } from './modules/restaurants/entities/restaurant.entity';
import { Branch } from './modules/branches/entities/branch.entity';
import { User } from './modules/users/entities/user.entity';
import { RestaurantStatus } from './common/enums';
import { SEED_USERS } from './seed/seed-users.data';

async function seedUsers() {
  const databaseUrl =
    process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

  const dataSource = new DataSource(
    databaseUrl
      ? {
          type: 'postgres',
          url: databaseUrl,
          ssl:
            process.env.DB_SSL === 'false'
              ? false
              : { rejectUnauthorized: false },
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        }
      : {
          type: (process.env.DB_TYPE as any) ?? 'postgres',
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '5432', 10),
          username: process.env.DB_USER ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'postgres',
          database: process.env.DB_NAME ?? 'rms',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        },
  );

  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Database connected successfully.');

  const restaurantRepo = dataSource.getRepository(Restaurant);
  const branchRepo = dataSource.getRepository(Branch);
  const userRepo = dataSource.getRepository(User);

  // 1. Ensure default Restaurant exists
  let restaurant = await restaurantRepo.findOne({ where: { code: 'GCB' } });
  if (!restaurant) {
    restaurant = restaurantRepo.create({
      name: 'Grand Cafe & Bistro',
      code: 'GCB',
      default_currency: 'USD',
      timezone: 'America/New_York',
      status: RestaurantStatus.ACTIVE,
      support_dine_in: true,
      support_pickup: true,
      support_delivery: true,
    });
    restaurant = await restaurantRepo.save(restaurant);
    console.log(`[Created Restaurant] ${restaurant.name} (#${restaurant.id})`);
  } else {
    console.log(`[Found Restaurant] ${restaurant.name} (#${restaurant.id})`);
  }

  // 2. Ensure default Branch exists
  let branch = await branchRepo.findOne({ where: { code: 'DT-01' } });
  if (!branch) {
    branch = branchRepo.create({
      restaurant_id: restaurant.id,
      name: 'Downtown Main Branch',
      code: 'DT-01',
      phone: '+1-555-0199',
      address_line_1: '100 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA',
    });
    branch = await branchRepo.save(branch);
    console.log(`[Created Branch] ${branch.name} (#${branch.id})`);
  } else {
    console.log(`[Found Branch] ${branch.name} (#${branch.id})`);
  }

  // 3. Seed Users with check: If user already exists in table, DO NOT seed!
  console.log('\n--- Seeding Users (Skip if user already exists) ---');
  const results: Array<{
    id: number | string;
    name: string;
    email: string;
    role: string;
    status: string;
  }> = [];

  for (const item of SEED_USERS) {
    const branchId = item.isBranchSpecific ? branch.id : null;
    
    // Check if user already exists by email
    const existingUser = await userRepo.findOne({
      where: {
        email: item.email.toLowerCase(),
      },
    });

    if (existingUser) {
      console.log(
        `[SKIP] User already exists in table: ${item.email} (#${existingUser.id}, ${existingUser.role}). Not seeding.`,
      );
      results.push({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: 'SKIPPED (ALREADY EXISTS)',
      });
      continue;
    }

    // Only seed if user does NOT exist
    let newUser = userRepo.create({
      restaurant_id: restaurant.id,
      branch_id: branchId,
      name: item.name,
      email: item.email.toLowerCase(),
      role: item.role,
      password_hash: item.password,
      is_active: true,
    });
    newUser = await userRepo.save(newUser);

    console.log(
      `[CREATED] Seeded new user: ${newUser.email} (#${newUser.id}, ${newUser.role})`,
    );
    results.push({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'CREATED',
    });
  }

  console.log('\n--- Seeding Summary ---');
  console.table(results);

  await dataSource.destroy();
  console.log('Database connection closed.');
}

seedUsers().catch((err) => {
  console.error('Failed to seed users:', err);
  process.exit(1);
});
