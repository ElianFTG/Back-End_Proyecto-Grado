import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

import { UserEntity } from "./UserEntity";
import { AreaEntity } from "./AreaEntity";

@Entity({ name: "routes" })
export class RouteEntity {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true })
  id!: number;

  @Column({ type: "timestamp" })
  assigned_date!: Date;

  @Index()
  @Column({ type: "smallint", unsigned: true })
  assigned_id_user!: number;

  @Index()
  @Column({ type: "smallint", unsigned: true })
  assigned_id_area!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: "assigned_id_user" })
  assigned_user!: UserEntity;

  @ManyToOne(() => AreaEntity, { nullable: false })
  @JoinColumn({ name: "assigned_id_area" })
  assigned_area!: AreaEntity;

  // Auditoría
  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true })
  state!: boolean;
}
