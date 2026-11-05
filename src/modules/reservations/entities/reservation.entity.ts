import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { ReservationStatus } from '../../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { DiningTable } from '../../dining-tables/entities/dining-table.entity';

@Entity('reservations')
export class Reservation extends BaseEntity {
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

  /** Operational link to customers module (no auth). */
  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customer_id!: number | null;

  @Column({ name: 'customer_name', type: 'varchar', length: 255 })
  customer_name!: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 32 })
  customer_phone!: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 255, nullable: true })
  customer_email!: string | null;

  @Column({ name: 'reservation_date', type: 'date' })
  reservation_date!: string;

  @Column({ name: 'reservation_time', type: 'time' })
  reservation_time!: string;

  @Column({ name: 'guest_count', type: 'int' })
  guest_count!: number;

  @Column({ name: 'table_id', type: 'int', nullable: true })
  table_id!: number | null;

  @ManyToOne(() => DiningTable, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'table_id' })
  table!: DiningTable | null;

  @Column({ name: 'special_request', type: 'text', nullable: true })
  special_request!: string | null;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.REQUESTED,
  })
  status!: ReservationStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
