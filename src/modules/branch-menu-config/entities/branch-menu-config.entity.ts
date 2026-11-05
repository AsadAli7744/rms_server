import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('branch_menu_config')
@Index(['branch_id', 'item_id'], { unique: true })
export class BranchMenuConfig extends BaseEntity {
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

  @Column({ name: 'item_id', type: 'int' })
  item_id!: number;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: MenuItem;

  @Column({ name: 'is_available_in_branch', type: 'boolean', default: true })
  is_available_in_branch!: boolean;

  @Column({ name: 'is_available_online', type: 'boolean', default: true })
  is_available_online!: boolean;

  @Column({ name: 'is_available_pos', type: 'boolean', default: true })
  is_available_pos!: boolean;

  @Column({
    name: 'price_override',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  price_override!: number | null;

  @Column({ name: 'pickup_available', type: 'boolean', default: true })
  pickup_available!: boolean;

  @Column({ name: 'delivery_available', type: 'boolean', default: true })
  delivery_available!: boolean;

  @Column({ name: 'dine_in_available', type: 'boolean', default: true })
  dine_in_available!: boolean;

  @Column({ name: 'daily_limit', type: 'int', nullable: true })
  daily_limit!: number | null;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sort_order!: number | null;

  @Column({ name: 'sold_out', type: 'boolean', default: false })
  sold_out!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
