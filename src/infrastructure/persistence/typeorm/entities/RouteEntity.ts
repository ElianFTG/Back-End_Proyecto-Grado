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


@Index("UQ_ROUTES_USER_DATE", ["assigned_id_user", "assigned_date"], { unique: true })
@Entity({ name: "routes" })
export class RouteEntity {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true })
  id!: number;

  @Column({ type: "date" })
  assigned_date!: string;

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

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true })
  state!: boolean;
}
