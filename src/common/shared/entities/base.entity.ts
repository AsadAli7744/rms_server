import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base audit fields shared across all business entities.
 *
 * Notes:
 * - We use `is_archived` for soft-archive instead of hard deletes.
 * - `created_by` / `updated_by` are nullable because auth/RBAC is out of scope.
 */
export abstract class BaseEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  created_by!: number | null;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updated_by!: number | null;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  is_archived!: boolean;
}

