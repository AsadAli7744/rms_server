import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import {
  FulfillmentType,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { DiningTable } from '../../dining-tables/entities/dining-table.entity';
import { OrderItem } from './order-item.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('orders')
@Index(['branch_id', 'status'])
@Index(['branch_id', 'created_at'])
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurant_id!: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ name: 'branch_id', type: 'int' })
  branch_id!: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({ name: 'table_id', type: 'int', nullable: true })
  table_id!: number | null;

  @ManyToOne(() => DiningTable, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'table_id' })
  table!: DiningTable | null;

  @Column({ name: 'order_number', type: 'varchar', length: 64, unique: true })
  order_number!: string;

  @Column({
    type: 'enum',
    enum: OrderSource,
    default: OrderSource.POS,
  })
  source!: OrderSource;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PLACED,
  })
  status!: OrderStatus;

  @Column({
    name: 'fulfillment_type',
    type: 'enum',
    enum: FulfillmentType,
    default: FulfillmentType.DINE_IN,
  })
  fulfillment_type!: FulfillmentType;

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  delivery_address!: string | null;

  @Column({
    name: 'delivery_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  delivery_fee!: number;

  @Column({ name: 'cancellation_reason', type: 'varchar', length: 255, nullable: true })
  cancellation_reason!: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  subtotal!: number;

  @Column({ name: 'discount_type', type: 'varchar', length: 32, nullable: true })
  discount_type!: 'percentage' | 'fixed' | null;

  @Column({
    name: 'discount_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  discount_value!: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  discount_amount!: number;

  @Column({ name: 'discount_reason', type: 'varchar', length: 255, nullable: true })
  discount_reason!: string | null;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  tax_amount!: number;

  @Column({
    name: 'service_charge',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  service_charge!: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  total_amount!: number;

  @Column({
    name: 'paid_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  paid_amount!: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status!: PaymentStatus;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  payment_method!: PaymentMethod | null;

  @Column({ name: 'customer_name', type: 'varchar', length: 255, nullable: true })
  customer_name!: string | null;

  @Column({ name: 'customer_phone', type: 'varchar', length: 64, nullable: true })
  customer_phone!: string | null;

  @Column({ name: 'waiter_name', type: 'varchar', length: 255, nullable: true })
  waiter_name!: string | null;

  @Column({ name: 'cashier_name', type: 'varchar', length: 255, nullable: true })
  cashier_name!: string | null;

  @Column({ name: 'is_queued', type: 'boolean', default: false })
  is_queued!: boolean;

  @Column({ name: 'queue_number', type: 'int', nullable: true })
  queue_number!: number | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'printed_at', type: 'timestamptz', nullable: true })
  printed_at!: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];
}
