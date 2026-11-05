import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { AvailabilityType } from '../../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('menu_categories')
@Index(['restaurant_id', 'slug'], { unique: true })
export class MenuCategory extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurant_id!: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 1024, nullable: true })
  image_url!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

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
