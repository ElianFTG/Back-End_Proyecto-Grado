import { Entity, PrimaryColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProductEntity } from './ProductEntity';
import { BranchEntity } from './BranchEntity';

@Entity({ name: 'product_branches' })
@Index('idx_pb_branch_has_stock', ['branch_id', 'has_stock'])
@Index('idx_pb_branch_product', ['branch_id', 'product_id'])
export class ProductBranchEntity {
    @PrimaryColumn({ type: 'smallint', unsigned: true })
    product_id!: number;

    @PrimaryColumn({ type: 'smallint', unsigned: true })
    branch_id!: number;

    @Column({ type: 'boolean', default: false })
    has_stock!: boolean;

    @Column({ type: 'int', nullable: true })
    stock_qty!: number | null;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @ManyToOne(() => ProductEntity, product => product.productBranches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product!: ProductEntity;

    @ManyToOne(() => BranchEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;
}
