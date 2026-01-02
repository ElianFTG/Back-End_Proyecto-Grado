import { ProductRepository, PaginatedProductsResult } from "../../domain/product/ProductRepository";
import { Product, SalePrice } from "../../domain/product/Product";
import { Repository, QueryDeepPartialEntity, FindOptionsWhere } from 'typeorm';
import { ProductEntity } from "../persistence/typeorm/entities/ProductEntity";
import { AppDataSource } from "../db/Mysql";

export class MysqlProductRepository implements ProductRepository {
    private readonly repo: Repository<ProductEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(ProductEntity);
    }

    async getAll(filters?: { categoryId?: number; brandId?: number; state?: boolean; page?: number, limit?: number }): Promise<PaginatedProductsResult> {
        try {
            const where: FindOptionsWhere<ProductEntity> = {};
            const page = filters?.page || 1;
            const limit = filters?.limit || 10;
            
            if (filters?.categoryId !== undefined) {
                where.category_id = filters.categoryId;
            }
            if (filters?.brandId !== undefined) {
                where.brand_id = filters.brandId;
            }
            if (filters?.state !== undefined) {
                where.state = filters.state;
            } else {
                where.state = true; // Por defecto solo activos
            }

            const [rows, total] = await this.repo.findAndCount({
                where,
                relations: ['category', 'brand', 'presentation', 'color'],
                order: { id: "DESC" },
                skip: (page - 1) * limit,
                take: limit,
            });

            const data = rows.map((row) => new Product(
                row.name,
                row.sale_price as SalePrice,
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
            ));

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

    async create(product: Product): Promise<Product | null> {
        try {
            const row = await this.repo.save({
                name: product.name,
                barcode: product.barcode,
                internal_code: product.internalCode,
                presentation_id: product.presentationId,
                color_id: product.colorId,
                sale_price: product.salePrice,
                category_id: product.categoryId,
                brand_id: product.brandId,
                user_id: product.userId,
            });

            // Cargar relaciones
            const savedProduct = await this.repo.findOne({
                where: { id: row.id },
                relations: ['category', 'brand', 'presentation', 'color']
            });

            if (!savedProduct) return null;

            return new Product(
                savedProduct.name,
                savedProduct.sale_price as SalePrice,
                savedProduct.category_id,
                savedProduct.brand_id,
                savedProduct.user_id,
                savedProduct.barcode,
                savedProduct.internal_code,
                savedProduct.presentation_id,
                savedProduct.color_id,
                savedProduct.state,
                savedProduct.id,
                savedProduct.created_at,
                savedProduct.updated_at,
                savedProduct.category?.name,
                savedProduct.brand?.name,
                savedProduct.presentation?.name,
                savedProduct.color?.name,
                savedProduct.url_image
            );
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async findById(id: number): Promise<Product | null> {
        try {
            const row = await this.repo.findOne({
                where: { id },
                relations: ['category', 'brand', 'presentation', 'color']
            });
            if (!row) return null;

            return new Product(
                row.name,
                row.sale_price as SalePrice,
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
            if (product.salePrice !== undefined) patch.sale_price = product.salePrice;
            
            if (product.categoryId !== undefined) patch.category_id = product.categoryId;
            if (product.brandId !== undefined) patch.brand_id = product.brandId;
            if ((product as any).pathImage !== undefined) patch.url_image = (product as any).pathImage;

            await this.repo.update({ id }, patch);

            const updatedProduct = await this.repo.findOne({
                where: { id },
                relations: ['category', 'brand', 'presentation', 'color']
            });

            if (!updatedProduct) return null;

            return new Product(
                updatedProduct.name,
                updatedProduct.sale_price as SalePrice,
                updatedProduct.category_id,
                updatedProduct.brand_id,
                updatedProduct.user_id,
                updatedProduct.barcode,
                updatedProduct.internal_code,
                updatedProduct.presentation_id,
                updatedProduct.color_id,
                updatedProduct.state,
                updatedProduct.id,
                updatedProduct.created_at,
                updatedProduct.updated_at,
                updatedProduct.category?.name,
                updatedProduct.brand?.name,
                updatedProduct.presentation?.name,
                updatedProduct.color?.name,
                updatedProduct.url_image
            );
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
