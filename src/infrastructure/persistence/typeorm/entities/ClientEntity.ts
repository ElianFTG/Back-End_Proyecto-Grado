import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { ClientTypeEntity } from "./ClientTypeEntity";
import { BusinessEntity } from "./BusinessEntity";

@Entity({ name: "clients" })
export class ClientEntity {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 120 })
  last_name!: string;

  @Column({ type: "varchar", length: 120 })
  second_last_name!: string;

  @Column({ type: "varchar", length: 30 })
  phone!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  ci!: string | null;

  @Index()
  @Column({ type: "smallint", unsigned: true })
  client_type_id!: number;

  @ManyToOne(() => ClientTypeEntity, (t) => t.clients, { nullable: false })
  @JoinColumn({ name: "client_type_id" })
  client_type!: ClientTypeEntity;

  @OneToMany(() => BusinessEntity, (b) => b.client)
  businesses!: BusinessEntity[];

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true })
  state!: boolean;
}
