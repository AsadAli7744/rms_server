import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { SelectionType } from '../../../common/enums';
import { MenuItem } from './menu-item.entity';
import { ItemAddonOption } from './item-addon-option.entity';

@Entity('item_addon_groups')
export class ItemAddonGroup extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'item_id', type: 'int' })
  item_id!: number;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: MenuItem;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({
    name: 'selection_type',
    type: 'enum',
    enum: SelectionType,
    default: SelectionType.SINGLE,
  })
  selection_type!: SelectionType;

  @Column({ name: 'min_selection', type: 'int', default: 0 })
  min_selection!: number;

  @Column({ name: 'max_selection', type: 'int', nullable: true })
  max_selection!: number | null;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  is_required!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @OneToMany(() => ItemAddonOption, (o) => o.addon_group)
  options!: ItemAddonOption[];
}
