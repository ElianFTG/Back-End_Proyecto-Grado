import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";


@Entity({ name: "clients" })
export class ClientEntity {
    @PrimaryGeneratedColumn({ type: "int" })
    id!: number;

    @Column({ type: "varchar", length: 180 })
    full_name!: string;

    @Column({
        type: "point",
        spatialFeatureType: "Point",
        srid: 4326,
    })
    position!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 30 })
    nit_ci!: string;

    @Column({ type: "varchar", length: 180 })
    business_name!: string;

    @Column({ type: "varchar", length: 30 })
    phone!: string;

    @Column({ type: "varchar", length: 60 })
    business_type!: string;

    @Column({ type: "varchar", length: 60 })
    client_type!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    address!: string | null;

    @Column({ type: "boolean", default: true })
    status!: boolean;

    @Column({ type: "varchar", length: 255, nullable: true })
    path_image!: string | null;

    @Column({ type: "smallint" })
    user_id!: number;

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;


    @Column({ type: "timestamp", nullable: true, default: null })
    updated_at!: Date | null;

    @BeforeInsert()
    setUpdatedAtNullOnInsert() {
      this.updated_at = null;
    }

    @BeforeUpdate()
    setUpdatedAtOnUpdate() {
      this.updated_at = new Date();
    }
}
