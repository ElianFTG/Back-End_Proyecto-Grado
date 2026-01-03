import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

/**
 * Tipo para coordenadas lat/lng
 */
export interface AreaPoint {
  lat: number;
  lng: number;
}

@Entity({ name: "areas" })
@Index(["name"])
@Index(["state"])
export class AreaEntity {

  @PrimaryGeneratedColumn({ type: "int", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;
  
  @Column({ type: "json" })
  area!: AreaPoint[];

  @Column({ type: "boolean", default: true })
  state!: boolean;

  @Column({ type: "int", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
