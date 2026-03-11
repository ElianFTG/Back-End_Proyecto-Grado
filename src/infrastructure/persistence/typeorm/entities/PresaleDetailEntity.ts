import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { PresaleEntity } from './PresaleEntity';
import { ProductEntity } from './ProductEntity';
import { ProductBranchEntity } from './ProductBranchEntity';
import { UserEntity } from './UserEntity';
import { PriceTypeEntity } from './PriceTypeEntity';

@Entity({ name: 'presale_details' })
@Index('idx_detail_presale', ['presale_id'])
@Index('idx_detail_product', ['product_id'])
@Index('idx_presale_detail_price_type', ['price_type_id'])
export class PresaleDetailEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Column({ name: 'presale_id', type: 'int' })
    presale_id!: number;

    @Column({ name: 'product_id', type: 'smallint', unsigned: true })
    product_id!: number;

    @Column({ name: 'branch_id', type: 'smallint', unsigned: true })
    branch_id!: number;

    @Column({ name: 'quantity_requested', type: 'int' })
    quantity_requested!: number;

    @Column({ name: 'quantity_delivered', type: 'int', nullable: true })
    quantity_delivered!: number | null;

    @Column({ name: 'price_type_id', type: 'smallint', unsigned: true })
    price_type_id!: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unit_price!: number;

    @Column({ name: 'final_unit_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    final_unit_price!: number | null;

    @Column({ name: 'subtotal_requested', type: 'decimal', precision: 12, scale: 2 })
    subtotal_requested!: number;

    @Column({ name: 'subtotal_delivered', type: 'decimal', precision: 12, scale: 2, nullable: true })
    subtotal_delivered!: number | null;

    @Column({ name: 'user_id', type: 'smallint', unsigned: true })
    user_id!: number;

    @Column({ name: 'state', type: 'tinyint', default: 1 })
    state!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    created_at!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
    updated_at!: Date;

    @ManyToOne(() => PresaleEntity, presale => presale.details, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'presale_id' })
    presale!: PresaleEntity;

    @ManyToOne(() => ProductEntity, { eager: false })
    @JoinColumn({ name: 'product_id' })
    product!: ProductEntity;

    @ManyToOne(() => ProductBranchEntity, { eager: false })
    @JoinColumn([
        { name: 'product_id', referencedColumnName: 'product_id' },
        { name: 'branch_id', referencedColumnName: 'branch_id' }
    ])
    productBranch!: ProductBranchEntity;

    @ManyToOne(() => UserEntity, { eager: false })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @ManyToOne(() => PriceTypeEntity, { eager: false })
    @JoinColumn({ name: 'price_type_id' })
    priceType!: PriceTypeEntity;
}
