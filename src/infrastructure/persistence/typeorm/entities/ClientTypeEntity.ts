import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ClientEntity } from "./ClientEntity";

@Entity({ name: "client_types" })
export class ClientTypeEntity {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true })
  state!: boolean;

  @OneToMany(() => ClientEntity, (c) => c.client_type)
  clients!: ClientEntity[];
}
