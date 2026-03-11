import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index
} from 'typeorm';
import { ClientEntity } from './ClientEntity';
import { BusinessEntity } from './BusinessEntity';
import { UserEntity } from './UserEntity';
import { BranchEntity } from './BranchEntity';
import { PresaleDetailEntity } from './PresaleDetailEntity';

@Entity({ name: 'presales' })
@Index('idx_presale_status', ['status'])
@Index('idx_presale_delivery_date', ['delivery_date'])
@Index('idx_presale_client', ['client_id'])
@Index('idx_presale_preseller', ['preseller_id'])
@Index('idx_presale_distributor', ['distributor_id'])
@Index('idx_presale_state', ['state'])
export class PresaleEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Column({ name: 'client_id', type: 'smallint', unsigned: true })
    client_id!: number;

    @Column({ name: 'business_id', type: 'smallint', unsigned: true, nullable: true })
    business_id!: number | null;

    @Column({ name: 'preseller_id', type: 'smallint', unsigned: true })
    preseller_id!: number;

    @Column({ name: 'distributor_id', type: 'smallint', unsigned: true, nullable: true })
    distributor_id!: number | null;

    @Column({ name: 'branch_id', type: 'smallint', unsigned: true })
    branch_id!: number;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    created_at!: Date;

    @Column({ name: 'delivery_date', type: 'date' })
    delivery_date!: Date;

    @Column({ name: 'delivered_at', type: 'datetime', nullable: true })
    delivered_at!: Date | null;

    @Column({
        name: 'status',
        type: 'enum',
        enum: ['pendiente', 'asignado', 'entregado', 'parcial', 'cancelado'],
        default: 'pendiente'
    })
    status!: string;

    @Column({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2, default: 0 })
    subtotal!: number;

    @Column({ name: 'total', type: 'decimal', precision: 12, scale: 2, default: 0 })
    total!: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes!: string | null;

    @Column({ name: 'delivery_notes', type: 'text', nullable: true })
    delivery_notes!: string | null;

    @Column({ name: 'user_id', type: 'smallint', unsigned: true })
    user_id!: number;

    @Column({ name: 'state', type: 'tinyint', default: 1 })
    state!: boolean;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
    updated_at!: Date;


    @ManyToOne(() => ClientEntity, { eager: false })
    @JoinColumn({ name: 'client_id' })
    client!: ClientEntity;

    @ManyToOne(() => BusinessEntity, { eager: false })
    @JoinColumn({ name: 'business_id' })
    business!: BusinessEntity | null;

    @ManyToOne(() => UserEntity, { eager: false })
    @JoinColumn({ name: 'preseller_id' })
    preseller!: UserEntity;

    @ManyToOne(() => UserEntity, { eager: false })
    @JoinColumn({ name: 'distributor_id' })
    distributor!: UserEntity | null;

    @ManyToOne(() => BranchEntity, { eager: false })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @ManyToOne(() => UserEntity, { eager: false })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @OneToMany(() => PresaleDetailEntity, detail => detail.presale, { eager: false })
    details!: PresaleDetailEntity[];
}
