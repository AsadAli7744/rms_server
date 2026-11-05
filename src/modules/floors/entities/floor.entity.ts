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

@Entity('floors')
@Index(['branch_id', 'name'], { unique: true })
export class Floor extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'branch_id', type: 'int' })
  branch_id!: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  code!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;
}
