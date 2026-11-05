import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/shared/entities/base.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('webhook_endpoints')
@Index(['restaurant_id', 'is_active'])
export class WebhookEndpoint extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurant_id!: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  /** When set, only events scoped to this branch should trigger (optional narrowing). */
  @Column({ name: 'branch_id', type: 'int', nullable: true })
  branch_id!: number | null;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch | null;

  @Column({ type: 'varchar', length: 128 })
  label!: string;

  @Column({ name: 'target_url', type: 'varchar', length: 2048 })
  target_url!: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  secret!: string | null;

  /** List of WebhookEventType string values; use "*" to subscribe to all. */
  @Column({ name: 'subscribed_events', type: 'jsonb' })
  subscribed_events!: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;
}
