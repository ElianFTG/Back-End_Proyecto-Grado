import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { ProductEntity } from './ProductEntity';
import { PriceTypeEntity } from './PriceTypeEntity';

@Entity({ name: 'product_prices' })
export class ProductPriceEntity {
    @PrimaryColumn({ type: 'smallint', unsigned: true })
    product_id!: number;

    @PrimaryColumn({ type: 'smallint', unsigned: true })
    price_type_id!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;

    @ManyToOne(() => ProductEntity, product => product.prices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product!: ProductEntity;

    @ManyToOne(() => PriceTypeEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'price_type_id' })
    priceType!: PriceTypeEntity;
}
