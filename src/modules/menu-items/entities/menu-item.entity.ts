import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import {
  AvailabilityType,
  MenuItemType,
  StationType,
} from '../../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { MenuCategory } from '../../menu-categories/entities/menu-category.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('menu_items')
@Index(['restaurant_id', 'slug'], { unique: true })
export class MenuItem extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurant_id!: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ name: 'category_id', type: 'int' })
  category_id!: number;

  @ManyToOne(() => MenuCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: MenuCategory;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  short_description!: string | null;

  @Column({ name: 'full_description', type: 'text', nullable: true })
  full_description!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 1024, nullable: true })
  image_url!: string | null;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: MenuItemType,
    default: MenuItemType.FOOD,
  })
  item_type!: MenuItemType;

  @Column({
    name: 'base_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalColumnTransformer,
  })
  base_price!: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sku!: string | null;

  @Column({
    name: 'preparation_station_type',
    type: 'enum',
    enum: StationType,
    default: StationType.KITCHEN,
  })
  preparation_station_type!: StationType;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  is_featured!: boolean;

  @Column({ name: 'is_spicy', type: 'boolean', default: false })
  is_spicy!: boolean;

  @Column({ name: 'is_veg', type: 'boolean', default: false })
  is_veg!: boolean;

  @Column({ name: 'is_halal', type: 'boolean', default: false })
  is_halal!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({
    name: 'availability_type',
    type: 'enum',
    enum: AvailabilityType,
    default: AvailabilityType.ALL_DAY,
  })
  availability_type!: AvailabilityType;
}
