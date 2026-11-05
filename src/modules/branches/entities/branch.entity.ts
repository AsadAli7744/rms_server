import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { BranchStatus, TaxMode } from '../../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('branches')
@Index(['restaurant_id', 'code'], { unique: true })
export class Branch extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurant_id!: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ name: 'address_line_1', type: 'varchar', length: 512 })
  address_line_1!: string;

  @Column({ name: 'address_line_2', type: 'varchar', length: 512, nullable: true })
  address_line_2!: string | null;

  @Column({ type: 'varchar', length: 128 })
  city!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  area!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  state!: string | null;

  @Column({ type: 'varchar', length: 128 })
  country!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 32, nullable: true })
  postal_code!: string | null;

  @Column({ type: 'double precision', nullable: true })
  latitude!: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude!: number | null;

  @Column({ name: 'online_ordering_enabled', type: 'boolean', default: true })
  online_ordering_enabled!: boolean;

  @Column({ name: 'pickup_enabled', type: 'boolean', default: true })
  pickup_enabled!: boolean;

  @Column({ name: 'delivery_enabled', type: 'boolean', default: true })
  delivery_enabled!: boolean;

  @Column({ name: 'dine_in_enabled', type: 'boolean', default: true })
  dine_in_enabled!: boolean;

  @Column({
    name: 'branch_status',
    type: 'enum',
    enum: BranchStatus,
    default: BranchStatus.ACTIVE,
  })
  branch_status!: BranchStatus;

  @Column({
    name: 'estimated_prep_time_minutes',
    type: 'int',
    default: 20,
  })
  estimated_prep_time_minutes!: number;

  @Column({
    name: 'minimum_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  minimum_order_amount!: number | null;

  @Column({
    name: 'packing_charge',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  packing_charge!: number | null;

  @Column({
    name: 'service_charge',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  service_charge!: number | null;

  @Column({
    name: 'tax_mode',
    type: 'enum',
    enum: TaxMode,
    default: TaxMode.EXCLUSIVE,
  })
  tax_mode!: TaxMode;

  @Column({
    name: 'default_tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 4,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  default_tax_rate!: number | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
