import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WebhookEndpoint } from './webhook-endpoint.entity';

@Entity('webhook_deliveries')
export class WebhookDelivery {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'endpoint_id', type: 'int' })
  endpoint_id!: number;

  @ManyToOne(() => WebhookEndpoint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'endpoint_id' })
  endpoint!: WebhookEndpoint;

  @Column({ name: 'event_type', type: 'varchar', length: 128 })
  event_type!: string;

  @Column({ name: 'request_body', type: 'jsonb' })
  request_body!: Record<string, unknown>;

  @Column({ name: 'response_status', type: 'int', nullable: true })
  response_status!: number | null;

  @Column({ name: 'response_body_snippet', type: 'text', nullable: true })
  response_body_snippet!: string | null;

  @Column({ type: 'boolean', default: false })
  success!: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message!: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;
}
