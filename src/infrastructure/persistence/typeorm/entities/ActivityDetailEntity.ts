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
import { BusinessEntity } from "./BusinessEntity";
import { ActivityEntity } from "./ActivityEntity";


@Entity({ name: "activitiy_details" })
export class ActivityDetailEntity {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true })
  id!: number;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @Column({
        name: 'action',
        type: 'enum',
        enum: ['visitado', 'preventa', 'venta'],
    })
  action!: string;

  @Index()
  @Column({ type: "smallint", unsigned: true, nullable: true })
  rejection_id!: number | null;

  @ManyToOne(() => RejectionEntity, { nullable: true })
  @JoinColumn({ name: "rejection_id" })
  rejection!: RejectionEntity | null;

  @Index()
  @Column({ type: "smallint", unsigned: true, nullable: false })
  activity_id!: number;

  @ManyToOne(() => ActivityEntity, { nullable: false })
  @JoinColumn({ name: "activity_id" })
  activity!: ActivityEntity;

  
  @Column({ type: "smallint", unsigned: true })
  business_id!: number;

  @ManyToOne(() => BusinessEntity, { nullable: false, createForeignKeyConstraints: false })
  @JoinColumn({ name: "business_id" })
  business!: BusinessEntity;
}
