import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { ItemAddonGroup } from './item-addon-group.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('item_addon_options')
export class ItemAddonOption extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'addon_group_id', type: 'int' })
  addon_group_id!: number;

  @ManyToOne(() => ItemAddonGroup, (g) => g.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addon_group_id' })
  addon_group!: ItemAddonGroup;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  price!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;
}
