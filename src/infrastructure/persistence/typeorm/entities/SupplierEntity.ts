import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CountryEntity } from './CountryEntity';

@Entity({ name: 'suppliers' })
export class SupplierEntity {
    @PrimaryGeneratedColumn({ type: 'smallint' })
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    nit!: string;

    @Column({ type: 'varchar', length: 200 })
    name!: string;

    @Column({ type: 'varchar', length: 50 })
    phone!: string;

    @Column({ type: 'smallint', nullable: true, unsigned: true })
    country_id!: number | null;

    @ManyToOne(() => CountryEntity, { eager: false, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'country_id' })
    country!: CountryEntity | null;

    @Column({ type: 'varchar', length: 255 })
    address!: string;

    @Column({ type: 'varchar', length: 150 })
    contact_name!: string;

    @Column({ type: 'boolean', default: true })
    state!: boolean;

    @Column({ type: 'smallint', nullable: true, unsigned: true })
    user_id!: number | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;
}
