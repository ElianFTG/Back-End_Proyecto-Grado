import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductEntity } from './ProductEntity';

@Entity({ name: 'brands' })
export class BrandEntity {
    @PrimaryGeneratedColumn({ type: 'smallint', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string;

    @Column({ type: 'boolean', default: true })
    state!: boolean;

    @Column({ type: 'smallint', unsigned: true })
    user_id!: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @OneToMany(() => ProductEntity, product => product.brand, { eager: false })
    products!: ProductEntity[];
}
