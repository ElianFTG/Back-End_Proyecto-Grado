import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "areas" })
export class AreaEntity {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 15 })
  name!: string;
}
