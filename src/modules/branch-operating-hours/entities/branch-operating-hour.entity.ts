import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { DayOfWeek } from '../../../common/enums';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('branch_operating_hours')
@Index(['branch_id', 'day_of_week'], { unique: true })
export class BranchOperatingHour extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'branch_id', type: 'int' })
  branch_id!: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({
    name: 'day_of_week',
    type: 'int',
  })
  day_of_week!: DayOfWeek;

  @Column({ name: 'open_time', type: 'time', nullable: true })
  open_time!: string | null;

  @Column({ name: 'close_time', type: 'time', nullable: true })
  close_time!: string | null;

  @Column({ name: 'is_closed', type: 'boolean', default: false })
  is_closed!: boolean;

  @Column({ name: 'supports_pickup', type: 'boolean', default: true })
  supports_pickup!: boolean;

  @Column({ name: 'supports_delivery', type: 'boolean', default: true })
  supports_delivery!: boolean;

  @Column({ name: 'supports_dine_in', type: 'boolean', default: true })
  supports_dine_in!: boolean;
}
