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

import { RejectionEntity } from "./RejectionEntity";
import { RouteEntity } from "./RouteEntity";
import { UserEntity } from "./UserEntity";
import { BusinessEntity } from "./BusinessEntity";


@Entity({ name: "activities" })
@Index("IDX_ACTIVITIES_ROUTE_BUSINESS", ["route_id", "business_id"])
export class ActivityEntity {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true })
  id!: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @Column({ type: "varchar", length: 10,nullable: true })
  action!: string;

  @Index()
  @Column({ type: "smallint", unsigned: true, nullable: true })
  rejection_id!: number | null;

  @ManyToOne(() => RejectionEntity, { nullable: true })
  @JoinColumn({ name: "rejection_id" })
  rejection!: RejectionEntity | null;

  @Index()
  @Column({ type: "int", unsigned: true })
  route_id!: number;

  @ManyToOne(() => RouteEntity, { nullable: false })
  @JoinColumn({ name: "route_id" })
  route!: RouteEntity;

  @Index()
  @Column({ type: "smallint", unsigned: true })
  responsible_user_id!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: "responsible_user_id" })
  responsible_user!: UserEntity;

  
  @Column({ type: "smallint", unsigned: true })
  business_id!: number;

  @ManyToOne(() => BusinessEntity, { nullable: false, createForeignKeyConstraints: false })
  @JoinColumn({ name: "business_id" })
  business!: BusinessEntity;

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true })
  state!: boolean;
}
