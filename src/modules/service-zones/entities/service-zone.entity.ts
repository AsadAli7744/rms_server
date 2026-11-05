import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { decimalColumnTransformer } from '../../../common/shared/transformers/decimal-column.transformer';

@Entity('service_zones')
export class ServiceZone extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'branch_id', type: 'int' })
  branch_id!: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({ name: 'zone_name', type: 'varchar', length: 255 })
  zone_name!: string;

  @Column({ name: 'zone_code', type: 'varchar', length: 64, nullable: true })
  zone_code!: string | null;

  @Column({
    name: 'min_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  min_order_amount!: number | null;

  @Column({
    name: 'delivery_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalColumnTransformer,
  })
  delivery_fee!: number;

  @Column({ name: 'estimated_delivery_minutes', type: 'int', default: 30 })
  estimated_delivery_minutes!: number;

  @Column({
    name: 'free_delivery_threshold',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  free_delivery_threshold!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
