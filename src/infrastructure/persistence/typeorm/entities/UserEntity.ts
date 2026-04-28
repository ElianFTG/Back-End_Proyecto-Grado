import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BranchEntity } from './BranchEntity';

@Entity({ name: 'users' })
export class UserEntity {

  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 15 , unique:true})
  ci!: string;

  @Column({ type: 'varchar', length: 120})
  names!: string;

  @Column({ type: 'varchar', length: 50})
  last_name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true})
  second_last_name!: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50 })
  role!: string;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  branch_id!: number | null;

  @ManyToOne(() => BranchEntity, { eager: false })
  @JoinColumn({ name: 'branch_id' })
  branch?: BranchEntity;

  @Column({ type: 'varchar', length: 50, unique:true })
  user_name!: string;
  
  @Column({ type: 'varchar', length: 255})
  password!: string;

  @Column({ type: 'boolean', default: true })
  is_first_login!: boolean;

  @Column({ type: 'boolean', default: 1 })
  state!: boolean;

  @Column({ type: 'smallint', nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}
