import { ProductRepository, PaginatedProductsResult } from "../../domain/product/ProductRepository";
import { Product, ProductPrice } from "../../domain/product/Product";
import { Repository, QueryDeepPartialEntity } from 'typeorm';
import { ProductEntity } from "../persistence/typeorm/entities/ProductEntity";
import { ProductPriceEntity } from "../persistence/typeorm/entities/ProductPriceEntity";
import { AppDataSource } from "../db/Mysql";

export class MysqlProductRepository implements ProductRepository {
    private readonly repo: Repository<ProductEntity>;
    private readonly priceRepo: Repository<ProductPriceEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(ProductEntity);
        this.priceRepo = AppDataSource.getRepository(ProductPriceEntity);
    }

    async getAll(filters?: { categoryId?: number; brandId?: number; state?: boolean; page?: number; limit?: number; search?: string }): Promise<PaginatedProductsResult> {
        try {
            const page = filters?.page || 1;
            const limit = filters?.limit || 10;
            const search = filters?.search?.trim() || '';

            const qb = this.repo.createQueryBuilder('p')
                .leftJoinAndSelect('p.category', 'category')
                .leftJoinAndSelect('p.brand', 'brand')
                .leftJoinAndSelect('p.presentation', 'presentation')
                .leftJoinAndSelect('p.color', 'color')
                .leftJoinAndSelect('p.prices', 'prices')
                .leftJoinAndSelect('prices.priceType', 'priceType');

            this.applyFilters(qb, filters);
            this.applySearch(qb, search);
            this.applyPagination(qb, page, limit);

            const [rows, total] = await qb.getManyAndCount();

            const data = rows.map((row) => this.mapEntityToProduct(row));

            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    private mapEntityToProduct(row: ProductEntity): Product {
        const prices: ProductPrice[] = (row.prices || []).map(p => ({
            priceTypeId: p.price_type_id,
            priceTypeName: p.priceType?.name,
            price: Number(p.price)
        }));

        return new Product(
            row.name,
            prices,
            row.category_id,
            row.brand_id,
            row.user_id,
            row.barcode,
            row.internal_code,
            row.presentation_id,
            row.color_id,
            row.state,
            row.id,
            row.created_at,
            row.updated_at,
            row.category?.name,
            row.brand?.name,
            row.presentation?.name,
            row.color?.name,
            row.url_image
        );
    }

    private applyFilters(qb: any, filters?: { categoryId?: number; brandId?: number; state?: boolean }) {
        if (filters?.categoryId !== undefined) {
            qb.andWhere('p.category_id = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.brandId !== undefined) {
            qb.andWhere('p.brand_id = :brandId', { brandId: filters.brandId });
        }
        if (filters?.state !== undefined) {
            qb.andWhere('p.state = :state', { state: filters.state });
        } else {
            qb.andWhere('p.state = :state', { state: true });
        }
    }

    private applySearch(qb: any, search: string) {
        if (search) {
            qb.andWhere('(p.name LIKE :search OR p.barcode LIKE :search OR p.internal_code LIKE :search)',
                { search: `%${search}%` });
        }
    }

    private applyPagination(qb: any, page: number, limit: number) {
        qb.orderBy('p.name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);
    }

    async create(product: Product): Promise<Product | null> {
        try {
            const row = await this.repo.save({
                name: product.name,
                barcode: product.barcode,
                internal_code: product.internalCode,
                presentation_id: product.presentationId,
                color_id: product.colorId,
                category_id: product.categoryId,
                brand_id: product.brandId,
                user_id: product.userId,
            });

            if (product.prices && product.prices.length > 0) {
                const priceEntities = product.prices.map(p => ({
                    product_id: row.id,
                    price_type_id: p.priceTypeId,
                    price: p.price
                }));
                await this.priceRepo.save(priceEntities);
            }
            return this.findById(row.id);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async findById(id: number): Promise<Product | null> {
        try {
            const row = await this.repo.findOne({
                where: { id },
                relations: ['category', 'brand', 'presentation', 'color', 'prices', 'prices.priceType']
            });
            if (!row) return null;

            return this.mapEntityToProduct(row);
        } catch (error) {
            return null;
        }
    }

    async update(id: number, product: Partial<Product>, userId: number): Promise<Product | null> {
        try {
            const patch: QueryDeepPartialEntity<ProductEntity> = {
                user_id: userId,
            };

            if (product.name !== undefined) patch.name = product.name;
            if (product.barcode !== undefined) patch.barcode = product.barcode;
            if (product.internalCode !== undefined) patch.internal_code = product.internalCode;
            if (product.presentationId !== undefined) patch.presentation_id = product.presentationId;
            if (product.colorId !== undefined) patch.color_id = product.colorId;
            if (product.categoryId !== undefined) patch.category_id = product.categoryId;
            if (product.brandId !== undefined) patch.brand_id = product.brandId;
            if ((product as any).pathImage !== undefined) patch.url_image = (product as any).pathImage;

            await this.repo.update({ id }, patch);

            if (product.prices !== undefined && product.prices.length > 0) {
                await this.priceRepo.delete({ product_id: id });
                const priceEntities = product.prices.map(p => ({
                    product_id: id,
                    price_type_id: p.priceTypeId,
                    price: p.price
                }));
                await this.priceRepo.save(priceEntities);
            }

            return this.findById(id);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async updateState(id: number, user_id: number): Promise<void> {
        try {
            const product = await this.repo.findOneBy({ id });
            if (product) {
                await this.repo.update({ id }, { state: !product.state, user_id });
            }
        } catch (error) {
            throw error;
        }
    }
}
