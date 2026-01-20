import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { CategoryEntity } from './CategoryEntity';
import { BrandEntity } from './BrandEntity';
import { PresentationEntity } from './PresentationEntity';
import { ColorEntity } from './ColorEntity';
import { ProductBranchEntity } from './ProductBranchEntity';

@Entity({ name: 'products' })
@Index('idx_products_category', ['category_id'])
@Index('idx_products_brand', ['brand_id'])
@Index('idx_products_state', ['state'])
export class ProductEntity {
    @PrimaryGeneratedColumn({ type: 'smallint', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 150 })
    name!: string;

    @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
    barcode!: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
    internal_code!: string | null;

    @Column({ type: 'smallint', unsigned: true, nullable: true })
    presentation_id!: number | null;

    @Column({ type: 'smallint', unsigned: true, nullable: true })
    color_id!: number | null;

    @Column({ type: 'json' })
    sale_price!: Record<string, number>;

    @Column({ type: 'varchar', length: 500, nullable: true })
    url_image!: string | null;

    @Column({ type: 'boolean', default: true })
    state!: boolean;

    @Column({ type: 'smallint' })
    category_id!: number;

    @Column({ type: 'smallint', unsigned: true })
    brand_id!: number;

    @Column({ type: 'smallint', nullable: true, unsigned: true })
    user_id!: number | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @ManyToOne(() => CategoryEntity, { eager: false })
    @JoinColumn({ name: 'category_id' })
    category!: CategoryEntity;

    @ManyToOne(() => BrandEntity, brand => brand.products, { eager: false })
    @JoinColumn({ name: 'brand_id' })
    brand!: BrandEntity;

    @ManyToOne(() => PresentationEntity, presentation => presentation.products, { eager: false })
    @JoinColumn({ name: 'presentation_id' })
    presentation!: PresentationEntity | null;

    @ManyToOne(() => ColorEntity, color => color.products, { eager: false })
    @JoinColumn({ name: 'color_id' })
    color!: ColorEntity | null;

    @OneToMany(() => ProductBranchEntity, pb => pb.product, { eager: false })
    productBranches!: ProductBranchEntity[];
}
