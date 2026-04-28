import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { BusinessEntity } from "./BusinessEntity";

@Entity({ name: "price_types" })
export class PriceTypeEntity {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true })
  state!: boolean;

  @OneToMany(() => BusinessEntity, (b) => b.price_type)
  businesses!: BusinessEntity[];
}
