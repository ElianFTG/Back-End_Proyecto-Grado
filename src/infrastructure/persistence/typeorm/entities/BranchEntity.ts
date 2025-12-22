import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity({ name: 'branches' })
export class BranchEntity {
    @PrimaryGeneratedColumn({ type: 'smallint', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 150, unique: true })
    name!: string;

    @Column({ type: 'boolean', default: true })
    state!: boolean;

    @Column({ type: 'smallint', nullable: true, unsigned: true })
    user_id!: number | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @OneToMany(() => UserEntity, user => user.branch, { eager: false })
    users!: UserEntity[];
}
