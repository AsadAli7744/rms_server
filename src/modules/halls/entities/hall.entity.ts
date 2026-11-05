import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Floor } from '../../floors/entities/floor.entity';

@Entity('halls')
@Index(['branch_id', 'floor_id', 'name'], { unique: true })
export class Hall extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'branch_id', type: 'int' })
  branch_id!: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({ name: 'floor_id', type: 'int' })
  floor_id!: number;

  @ManyToOne(() => Floor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'floor_id' })
  floor!: Floor;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  code!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;
}
