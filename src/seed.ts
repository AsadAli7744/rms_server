import { DataSource } from 'typeorm';
import { Restaurant } from './modules/restaurants/entities/restaurant.entity';
import { Branch } from './modules/branches/entities/branch.entity';
import { DiningTable } from './modules/dining-tables/entities/dining-table.entity';
import { MenuCategory } from './modules/menu-categories/entities/menu-category.entity';
import { MenuItem } from './modules/menu-items/entities/menu-item.entity';
import { User } from './modules/users/entities/user.entity';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import {
  AvailabilityType,
  KitchenItemStatus,
  MenuItemType,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RestaurantStatus,
  StationType,
  TableStatus,
  UserRole,
} from './common/enums';

async function seed() {
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

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const restaurantRepo = dataSource.getRepository(Restaurant);
  const branchRepo = dataSource.getRepository(Branch);
  const tableRepo = dataSource.getRepository(DiningTable);
  const catRepo = dataSource.getRepository(MenuCategory);
  const itemRepo = dataSource.getRepository(MenuItem);
  const userRepo = dataSource.getRepository(User);
  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);

  // 1. Restaurant
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
    console.log('Created Restaurant:', restaurant.name);
  }

  // 2. Branch
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
    console.log('Created Branch:', branch.name);
  }

  // 3. Dining Tables
  const tableCodes = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05'];
  for (let i = 0; i < tableCodes.length; i++) {
    const code = tableCodes[i];
    let table = await tableRepo.findOne({ where: { branch_id: branch.id, code } });
    if (!table) {
      table = tableRepo.create({
        branch_id: branch.id,
        code,
        name: `Dining Table ${code}`,
        seating_capacity: 4,
        status: TableStatus.AVAILABLE,
        sort_order: i + 1,
      });
      await tableRepo.save(table);
    }
  }

  // 4. Menu Categories
  const catNames = ['Beverages', 'Salads', 'Burgers & Mains', 'Desserts'];
  const categories: MenuCategory[] = [];
  for (let i = 0; i < catNames.length; i++) {
    const name = catNames[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let cat = await catRepo.findOne({ where: { restaurant_id: restaurant.id, slug } });
    if (!cat) {
      cat = catRepo.create({
        restaurant_id: restaurant.id,
        name,
        slug,
        sort_order: i + 1,
        is_active: true,
      });
      cat = await catRepo.save(cat);
    }
    categories.push(cat);
  }

  // 5. Menu Items
  const itemsData = [
    { name: 'Cold Drinks (Soda)', slug: 'cold-drinks', price: 3.50, sku: 'BEV-001', catIndex: 0, station: StationType.BAR },
    { name: 'Fresh Mint Lemonade', slug: 'mint-lemonade', price: 4.50, sku: 'BEV-002', catIndex: 0, station: StationType.BAR },
    { name: 'Caesar Salad', slug: 'caesar-salad', price: 12.00, sku: 'SLD-001', catIndex: 1, station: StationType.KITCHEN },
    { name: 'Greek Salad', slug: 'greek-salad', price: 11.50, sku: 'SLD-002', catIndex: 1, station: StationType.KITCHEN },
    { name: 'Classic Cheeseburger', slug: 'classic-cheeseburger', price: 14.00, sku: 'BGR-001', catIndex: 2, station: StationType.KITCHEN },
    { name: 'BBQ Bacon Burger', slug: 'bbq-bacon-burger', price: 16.50, sku: 'BGR-002', catIndex: 2, station: StationType.KITCHEN },
    { name: 'Chocolate Lava Cake', slug: 'lava-cake', price: 8.00, sku: 'DST-001', catIndex: 3, station: StationType.DESSERT },
  ];

  const createdItems: MenuItem[] = [];
  for (const item of itemsData) {
    let menuItem = await itemRepo.findOne({ where: { restaurant_id: restaurant.id, slug: item.slug } });
    if (!menuItem) {
      menuItem = itemRepo.create({
        restaurant_id: restaurant.id,
        category_id: categories[item.catIndex].id,
        name: item.name,
        slug: item.slug,
        base_price: item.price,
        sku: item.sku,
        item_type: MenuItemType.FOOD,
        preparation_station_type: item.station,
        is_active: true,
        availability_type: AvailabilityType.ALL_DAY,
      });
      menuItem = await itemRepo.save(menuItem);
    }
    createdItems.push(menuItem);
  }

  // 6. Users
  const usersData = [
    { name: 'Sarah Cashier', email: 'cashier@restaurant.com', role: UserRole.CASHIER },
    { name: 'Chef Gordon', email: 'kitchen@restaurant.com', role: UserRole.KITCHEN },
    { name: 'David Manager', email: 'manager@restaurant.com', role: UserRole.MANAGER },
  ];
  for (const u of usersData) {
    let user = await userRepo.findOne({ where: { restaurant_id: restaurant.id, email: u.email } });
    if (!user) {
      user = userRepo.create({
        restaurant_id: restaurant.id,
        branch_id: branch.id,
        name: u.name,
        email: u.email,
        role: u.role,
        is_active: true,
      });
      await userRepo.save(user);
    }
  }

  // 7. Seed Sample Orders with quantity & discounts
  const orderCount = await orderRepo.count({ where: { branch_id: branch.id } });
  if (orderCount === 0) {
    console.log('Generating sample orders with item quantities and discounts...');
    const coldDrink = createdItems[0];
    const caesarSalad = createdItems[2];
    const burger = createdItems[4];

    for (let day = 0; day < 5; day++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - day);

      for (let j = 0; j < 5; j++) {
        const coldDrinkQty = Math.floor(10 + Math.random() * 20);
        const saladQty = Math.floor(2 + Math.random() * 5);
        const burgerQty = Math.floor(1 + Math.random() * 4);

        const subtotal =
          coldDrinkQty * Number(coldDrink.base_price) +
          saladQty * Number(caesarSalad.base_price) +
          burgerQty * Number(burger.base_price);

        const hasDiscount = j % 2 === 0;
        const discountType = hasDiscount ? (j === 0 ? 'percentage' : 'fixed') : null;
        const discountVal = hasDiscount ? (discountType === 'percentage' ? 10 : 15) : 0;
        const discountAmount = hasDiscount
          ? discountType === 'percentage'
            ? Math.round((subtotal * 0.1) * 100) / 100
            : Math.min(15, subtotal)
          : 0;

        const discountReason = hasDiscount
          ? j === 0
            ? 'Happy Hour Special'
            : 'Manager Courtesy'
          : null;

        const discountedSub = subtotal - discountAmount;
        const tax = Math.round(discountedSub * 0.05 * 100) / 100;
        const total = Math.round((discountedSub + tax) * 100) / 100;

        const order = orderRepo.create({
          restaurant_id: restaurant.id,
          branch_id: branch.id,
          order_number: `ORD-SEED-${day}-${j}-${Math.floor(100 + Math.random() * 900)}`,
          source: j === 1 ? OrderSource.WEB : OrderSource.POS,
          status: OrderStatus.COMPLETED,
          subtotal: Math.round(subtotal * 100) / 100,
          discount_type: discountType as any,
          discount_value: discountVal,
          discount_amount: discountAmount,
          discount_reason: discountReason,
          tax_amount: tax,
          service_charge: 0,
          total_amount: total,
          paid_amount: total,
          payment_status: PaymentStatus.PAID,
          payment_method: PaymentMethod.CARD,
          created_at: orderDate,
          updated_at: orderDate,
          items: [
            orderItemRepo.create({
              item_id: coldDrink.id,
              item_name: coldDrink.name,
              unit_price: Number(coldDrink.base_price),
              quantity: coldDrinkQty,
              subtotal: coldDrinkQty * Number(coldDrink.base_price),
              station_type: coldDrink.preparation_station_type,
              status: KitchenItemStatus.SERVED,
              created_at: orderDate,
            }),
            orderItemRepo.create({
              item_id: caesarSalad.id,
              item_name: caesarSalad.name,
              unit_price: Number(caesarSalad.base_price),
              quantity: saladQty,
              subtotal: saladQty * Number(caesarSalad.base_price),
              station_type: caesarSalad.preparation_station_type,
              status: KitchenItemStatus.SERVED,
              created_at: orderDate,
            }),
            orderItemRepo.create({
              item_id: burger.id,
              item_name: burger.name,
              unit_price: Number(burger.base_price),
              quantity: burgerQty,
              subtotal: burgerQty * Number(burger.base_price),
              station_type: burger.preparation_station_type,
              status: KitchenItemStatus.SERVED,
              created_at: orderDate,
            }),
          ],
        });
        await orderRepo.save(order);
      }
    }
    console.log('Sample orders successfully seeded!');
  }

  console.log('Seeding completed successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
