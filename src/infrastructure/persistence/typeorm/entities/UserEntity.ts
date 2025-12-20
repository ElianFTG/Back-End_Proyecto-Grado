import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {

  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 15})
  ci!: string;

  @Column({ type: 'varchar', length: 120})
  names!: string;

  @Column({ type: 'varchar', length: 50})
  last_name!: string;

  @Column({ type: 'varchar', length: 50 })
  second_last_name!: string;

  @Column({ type: 'varchar', length: 50 })
  role!: string;

  @Column({ type: 'int', nullable: true })
  branch_id!: number | null;

  @Column({ type: 'varchar', length: 50 })
  user_name!: string;
  
  @Column({ type: 'varchar', length: 255})
  password!: string;

  @Column({ type: 'boolean', default: 1 })
  state!: boolean;

  @Column({ type: 'int', nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
