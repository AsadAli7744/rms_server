import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('branch_settings')
export class BranchSettings extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'branch_id', type: 'int', unique: true })
  branch_id!: number;

  @OneToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({ name: 'order_number_prefix', type: 'varchar', length: 16, nullable: true })
  order_number_prefix!: string | null;

  @Column({ name: 'receipt_footer', type: 'text', nullable: true })
  receipt_footer!: string | null;

  @Column({ name: 'notification_email', type: 'varchar', length: 255, nullable: true })
  notification_email!: string | null;

  /** Extensible key-value or structured settings (SaaS-friendly). */
  @Column({ name: 'settings_json', type: 'jsonb', nullable: true })
  settings_json!: Record<string, unknown> | null;
}
