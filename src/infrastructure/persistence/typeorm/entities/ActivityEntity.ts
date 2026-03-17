import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";

import { UserEntity } from "./UserEntity";



@Entity({ name: "activities" })
export class ActivityEntity {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true })
  id!: number;

  @Index()
  @Column({ type: "smallint", unsigned: true })
  responsible_user_id!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: "responsible_user_id" })
  responsible_user!: UserEntity;

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "date" })
  assigned_date!: Date;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
