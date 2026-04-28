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
@Index("ICX_ACTIVITIES_RESPONSIBLE_DATE", ["responsible_user_id", "assigned_date"], { unique: true })
export class ActivityEntity {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true })
  id!: number;

  @Column({ type: "smallint", unsigned: true })
  responsible_user_id!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: "responsible_user_id" })
  responsible_user!: UserEntity;

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @Column({ type: "date" })
  assigned_date!: Date;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;
}
