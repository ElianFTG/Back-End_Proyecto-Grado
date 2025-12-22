import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BranchEntity } from './BranchEntity';

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

  @Column({ type: 'smallint', unsigned: true })
  branch_id!: number | null;

  @ManyToOne(() => BranchEntity, { eager: false })
  @JoinColumn({ name: 'branch_id' })
  branch?: BranchEntity;

  @Column({ type: 'varchar', length: 50, unique:true })
  user_name!: string;
  
  @Column({ type: 'varchar', length: 255})
  password!: string;

  @Column({ type: 'boolean', default: 1 })
  state!: boolean;

  @Column({ type: 'smallint', nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
