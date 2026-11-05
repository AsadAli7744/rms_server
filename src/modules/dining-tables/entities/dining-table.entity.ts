import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { TableStatus } from '../../../common/enums';
import { Branch } from '../../branches/entities/branch.entity';
import { Floor } from '../../floors/entities/floor.entity';
import { Hall } from '../../halls/entities/hall.entity';

@Entity('dining_tables')
@Index(['branch_id', 'code'], { unique: true })
export class DiningTable extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'branch_id', type: 'int' })
  branch_id!: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  /** Legacy free-text label; prefer `floor_id` / `hall_id` when set. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  floor!: string | null;

  /** Legacy free-text label; prefer `hall_id` when set. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  section!: string | null;

  @Column({ name: 'floor_id', type: 'int', nullable: true })
  floor_id!: number | null;

  @ManyToOne(() => Floor, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'floor_id' })
  floor_ref!: Floor | null;

  @Column({ name: 'hall_id', type: 'int', nullable: true })
  hall_id!: number | null;

  @ManyToOne(() => Hall, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'hall_id' })
  hall_ref!: Hall | null;

  @Column({ name: 'seating_capacity', type: 'int', default: 4 })
  seating_capacity!: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status!: TableStatus;

  @Column({ name: 'qr_code', type: 'varchar', length: 512, nullable: true })
  qr_code!: string | null;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sort_order!: number | null;
}
