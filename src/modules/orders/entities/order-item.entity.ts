import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { KitchenItemStatus, StationType } from '../../../common/enums';
import { Order } from './order.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('order_items')
@Index(['order_id'])
@Index(['item_id'])
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'order_id', type: 'int' })
  order_id!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'item_id', type: 'int' })
  item_id!: number;

  @ManyToOne(() => MenuItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_id' })
  item!: MenuItem;

  @Column({ name: 'item_name', type: 'varchar', length: 255 })
  item_name!: string;

  @Column({ name: 'variant_id', type: 'int', nullable: true })
  variant_id!: number | null;

  @Column({ name: 'variant_name', type: 'varchar', length: 255, nullable: true })
  variant_name!: string | null;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalColumnTransformer,
  })
  unit_price!: number;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalColumnTransformer,
  })
  subtotal!: number;

  @Column({
    name: 'station_type',
    type: 'enum',
    enum: StationType,
    default: StationType.KITCHEN,
  })
  station_type!: StationType;

  @Column({
    type: 'enum',
    enum: KitchenItemStatus,
    default: KitchenItemStatus.QUEUED,
  })
  status!: KitchenItemStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
