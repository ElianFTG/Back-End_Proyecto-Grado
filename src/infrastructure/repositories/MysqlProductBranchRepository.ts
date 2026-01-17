import { ProductBranchRepository } from "../../domain/product_branch/ProductBranchRepository";
import { ProductBranch } from "../../domain/product_branch/ProductBranch";
import { ProductBranchFilters, PaginatedBranchProducts, ProductWithBranchInfo } from "../../domain/product_branch/ProductBranchFilters";
import { Repository } from 'typeorm';
import { ProductBranchEntity } from "../persistence/typeorm/entities/ProductBranchEntity";
import { ProductEntity } from "../persistence/typeorm/entities/ProductEntity";
import { AppDataSource } from "../db/Mysql";

export class MysqlProductBranchRepository implements ProductBranchRepository {
    private readonly repo: Repository<ProductBranchEntity>;
    private readonly productRepo: Repository<ProductEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(ProductBranchEntity);
        this.productRepo = AppDataSource.getRepository(ProductEntity);
    }

    async getProductsByBranchPaginated(filters: ProductBranchFilters): Promise<PaginatedBranchProducts<ProductWithBranchInfo>> {
        const {
            branchId,
            search = '',
            categoryId,
            brandId,
            onlyAvailable = false,
            page = 1,
            limit = 50
        } = filters;

        const safeLimit = Math.min(Math.max(1, limit), 100);
        const safePage = Math.max(1, page);
        const offset = (safePage - 1) * safeLimit;

        try {
            const qb = this.productRepo.createQueryBuilder('p')
                .leftJoinAndSelect('p.category', 'cat')
                .leftJoinAndSelect('p.brand', 'brand')
                .where('p.state = :state', { state: true });

            if (onlyAvailable) {
                qb.innerJoin(
                    ProductBranchEntity,
                    'pb',
                    'pb.product_id = p.id AND pb.branch_id = :branchId AND pb.has_stock = true',
                    { branchId }
                );
                qb.addSelect('pb.has_stock', 'pb_has_stock');
                qb.addSelect('pb.stock_qty', 'pb_stock_qty');
            } else {
                qb.leftJoin(
                    ProductBranchEntity,
                    'pb',
                    'pb.product_id = p.id AND pb.branch_id = :branchId',
                    { branchId }
                );
                qb.addSelect('pb.has_stock', 'pb_has_stock');
                qb.addSelect('pb.stock_qty', 'pb_stock_qty');
            }
            if (search && search.trim().length > 0) {
                const searchTerm = `%${search.trim()}%`;
                qb.andWhere(
                    '(p.name LIKE :search OR p.barcode LIKE :search OR p.internal_code LIKE :search)',
                    { search: searchTerm }
                );
            }
            if (categoryId) {
                qb.andWhere('p.category_id = :categoryId', { categoryId });
            }
            if (brandId) {
                qb.andWhere('p.brand_id = :brandId', { brandId });
            }
            
            qb.orderBy('p.name', 'ASC');
            const total = await qb.getCount();
            qb.skip(offset).take(safeLimit);
            const rawResults = await qb.getRawAndEntities();

            const data: ProductWithBranchInfo[] = rawResults.entities.map((product, index) => {
                const raw = rawResults.raw[index];
                return {
                    id: product.id,
                    name: product.name,
                    barcode: product.barcode,
                    internalCode: product.internal_code,
                    presentationId: product.presentation_id,
                    colorId: product.color_id,
                    salePrice: product.sale_price,
                    brand: {
                        id: product.brand?.id ?? product.brand_id,
                        name: product.brand?.name ?? ''
                    },
                    category: {
                        id: product.category?.id ?? product.category_id,
                        name: product.category?.name ?? ''
                    },
                    branch: {
                        branchId: branchId,
                        hasStock: raw.pb_has_stock === true || raw.pb_has_stock === 1,
                        stockQty: raw.pb_stock_qty ?? null
                    }
                };
            });

            return {
                data,
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit)
            };
        } catch (error) {
            console.error('Error en getProductsByBranchPaginated:', error);
            return {
                data: [],
                page: safePage,
                limit: safeLimit,
                total: 0,
                totalPages: 0
            };
        }
    }

    async upsertStock(
        productId: number,
        branchId: number,
        hasStock: boolean,
        stockQty?: number | null
    ): Promise<{ success: boolean; deleted?: boolean }> {
        try {
            if (!hasStock) {
                const deleted = await this.deleteRelation(productId, branchId);
                return { success: true, deleted };
            }

            const existing = await this.repo.findOne({
                where: { product_id: productId, branch_id: branchId }
            });

            if (existing) {
                await this.repo.update(
                    { product_id: productId, branch_id: branchId },
                    { has_stock: true, stock_qty: stockQty ?? null }
                );
            } else {
                await this.repo.save({
                    product_id: productId,
                    branch_id: branchId,
                    has_stock: true,
                    stock_qty: stockQty ?? null
                });
            }

            return { success: true, deleted: false };
        } catch (error) {
            console.error('Error en upsertStock:', error);
            return { success: false };
        }
    }

    private async deleteRelation(productId: number, branchId: number): Promise<boolean> {
        try {
            const result = await this.repo.delete({
                product_id: productId,
                branch_id: branchId
            });
            return (result.affected ?? 0) > 0;
        } catch (error) {
            console.error('Error en deleteRelation:', error);
            return false;
        }
    }

    async findByProductAndBranch(productId: number, branchId: number): Promise<ProductBranch | null> {
        try {
            const row = await this.repo.findOne({
                where: { product_id: productId, branch_id: branchId },
                relations: ['product']
            });

            if (!row) return null;

            return new ProductBranch(
                row.product_id,
                row.branch_id,
                row.has_stock,
                row.stock_qty,
                row.updated_at,
                row.product?.name,
                row.product?.barcode,
                row.product?.sale_price
            );
        } catch (error) {
            return null;
        }
    }
}
