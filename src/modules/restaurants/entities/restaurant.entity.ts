import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { RestaurantStatus } from '../../../common/enums';

@Entity('restaurants')
@Index(['code'], { unique: true })
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 1024, nullable: true })
  logo_url!: string | null;

  @Column({ name: 'default_currency', type: 'varchar', length: 8 })
  default_currency!: string;

  @Column({ type: 'varchar', length: 64 })
  timezone!: string;

  @Column({ name: 'support_dine_in', type: 'boolean', default: true })
  support_dine_in!: boolean;

  @Column({ name: 'support_pickup', type: 'boolean', default: true })
  support_pickup!: boolean;

  @Column({ name: 'support_delivery', type: 'boolean', default: true })
  support_delivery!: boolean;

  @Column({
    type: 'enum',
    enum: RestaurantStatus,
    default: RestaurantStatus.ACTIVE,
  })
  status!: RestaurantStatus;
}
