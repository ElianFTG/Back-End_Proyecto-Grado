import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Entidad de Área con geometría espacial MySQL
 * Igual que en rama main pero con soft delete (state)
 */
@Entity({ name: "areas" })
export class AreaEntity {

  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({
    type: "polygon",
    spatialFeatureType: "Polygon",
    srid: 4326,
    nullable: true,
  })
  area!: string;

  @Column({ type: "boolean", default: true })
  state!: boolean;

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
