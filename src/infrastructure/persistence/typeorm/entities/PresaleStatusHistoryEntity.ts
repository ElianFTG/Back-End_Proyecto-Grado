import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { PresaleEntity } from './PresaleEntity';
import { UserEntity } from './UserEntity';

@Entity({ name: 'presale_status_history' })
@Index('idx_history_presale', ['presale_id'])
export class PresaleStatusHistoryEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Column({ name: 'presale_id', type: 'int' })
    presale_id!: number;

    @Column({ name: 'previous_status', type: 'varchar', length: 50, nullable: true })
    previous_status!: string | null;

    @Column({ name: 'new_status', type: 'varchar', length: 50 })
    new_status!: string;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes!: string | null;

    @Column({ name: 'user_id', type: 'smallint', unsigned: true })
    user_id!: number;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    created_at!: Date;

    // ==================== RELACIONES ====================

    @ManyToOne(() => PresaleEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'presale_id' })
    presale!: PresaleEntity;

    @ManyToOne(() => UserEntity, { eager: false })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;
}
