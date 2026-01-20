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

import { BusinessTypeEntity } from "./BusinessTypeEntity";
import { ClientEntity } from "./ClientEntity";
import { AreaEntity } from "./AreaEntity";

@Entity({ name: "business" })
export class BusinessEntity {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  nit!: string | null;

  @Column({
    type: "point",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  position!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  path_image!: string | null; 

  @Column({ type: "varchar", length: 255, nullable: true })
  address!: string | null;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @Index()
  @Column({ type: "smallint", unsigned: true })
  business_type_id!: number;

  @ManyToOne(() => BusinessTypeEntity, (t) => t.businesses, { nullable: false })
  @JoinColumn({ name: "business_type_id" })
  business_type!: BusinessTypeEntity;

  @Index()
  @Column({ type: "smallint", unsigned: true })
  client_id!: number;

  @ManyToOne(() => ClientEntity, (c) => c.businesses, { nullable: false })
  @JoinColumn({ name: "client_id" })
  client!: ClientEntity;

  @Index()
  @Column({ type: "smallint", unsigned: true, nullable: true })
  area_id!: number | null;

  @ManyToOne(() => AreaEntity, { nullable: true })
  @JoinColumn({ name: "area_id" })
  area!: AreaEntity | null;

  // Auditoría
  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  // Soft-delete / auditoría
  @Column({ type: "boolean", default: true })
  state!: boolean;
}
