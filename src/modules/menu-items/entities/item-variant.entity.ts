import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { MenuItem } from './menu-item.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('item_variants')
export class ItemVariant extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'item_id', type: 'int' })
  item_id!: number;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: MenuItem;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sku!: string | null;

  @Column({
    name: 'price_adjustment',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  price_adjustment!: number;

  @Column({
    name: 'override_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  override_price!: number | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;
}
