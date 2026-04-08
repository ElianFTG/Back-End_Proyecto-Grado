import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "rejections" })
export class RejectionEntity {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "smallint", nullable: true })
  user_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true })
  state!: boolean;
}
