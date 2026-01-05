import { ProductBranchRepository } from "../../domain/product_branch/ProductBranchRepository";
import { ProductBranch } from "../../domain/product_branch/ProductBranch";
import { ProductBranchFilters, PaginatedBranchProducts, ProductWithBranchInfo } from "../../domain/product_branch/ProductBranchFilters";
import { Repository } from 'typeorm';
import { ProductBranchEntity } from "../persistence/typeorm/entities/ProductBranchEntity";
import { ProductEntity } from "../persistence/typeorm/entities/ProductEntity";
import { BranchEntity } from "../persistence/typeorm/entities/BranchEntity";
import { AppDataSource } from "../db/Mysql";

export class MysqlProductBranchRepository implements ProductBranchRepository {
    private readonly repo: Repository<ProductBranchEntity>;
    private readonly productRepo: Repository<ProductEntity>;
    private readonly branchRepo: Repository<BranchEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(ProductBranchEntity);
        this.productRepo = AppDataSource.getRepository(ProductEntity);
        this.branchRepo = AppDataSource.getRepository(BranchEntity);
    }

    /**
     * @deprecated Ya no se usa para escalabilidad - no crear filas al crear producto
     */
    async initializeForProduct(productId: number): Promise<void> {
        // Ya no inicializamos filas para todas las sucursales
        // Las filas se crean solo cuando se setea has_stock=true
        console.log(`[DEPRECATED] initializeForProduct llamado para producto ${productId}. Ya no se crean filas automáticamente.`);
    }

    /**
     * Consulta paginada optimizada para productos por sucursal
     */
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

        // Limitar el máximo a 100
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const safePage = Math.max(1, page);
        const offset = (safePage - 1) * safeLimit;

        try {
            const qb = this.productRepo.createQueryBuilder('p')
                .leftJoinAndSelect('p.category', 'cat')
                .leftJoinAndSelect('p.brand', 'brand')
                .where('p.state = :state', { state: true });

            if (onlyAvailable) {
                // INNER JOIN: solo productos con stock en esta sucursal
                qb.innerJoin(
                    ProductBranchEntity,
                    'pb',
                    'pb.product_id = p.id AND pb.branch_id = :branchId AND pb.has_stock = true',
                    { branchId }
                );
                qb.addSelect('pb.has_stock', 'pb_has_stock');
                qb.addSelect('pb.stock_qty', 'pb_stock_qty');
            } else {
                // LEFT JOIN: todos los productos, con o sin fila en product_branches
                qb.leftJoin(
                    ProductBranchEntity,
                    'pb',
                    'pb.product_id = p.id AND pb.branch_id = :branchId',
                    { branchId }
                );
                qb.addSelect('pb.has_stock', 'pb_has_stock');
                qb.addSelect('pb.stock_qty', 'pb_stock_qty');
            }

            // Filtro por búsqueda (nombre, barcode, internal_code)
            if (search && search.trim().length > 0) {
                const searchTerm = `%${search.trim()}%`;
                qb.andWhere(
                    '(p.name LIKE :search OR p.barcode LIKE :search OR p.internal_code LIKE :search)',
                    { search: searchTerm }
                );
            }

            // Filtro por categoría
            if (categoryId) {
                qb.andWhere('p.category_id = :categoryId', { categoryId });
            }

            // Filtro por marca
            if (brandId) {
                qb.andWhere('p.brand_id = :brandId', { brandId });
            }

            // Ordenar por nombre
            qb.orderBy('p.name', 'ASC');

            // Contar total antes de paginar
            const total = await qb.getCount();

            // Aplicar paginación
            qb.skip(offset).take(safeLimit);

            // Ejecutar query raw para obtener los campos seleccionados
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

    /**
     * UPSERT optimizado: inserta/actualiza si has_stock=true, elimina si has_stock=false
     */
    async upsertStock(
        productId: number,
        branchId: number,
        hasStock: boolean,
        stockQty?: number | null
    ): Promise<{ success: boolean; deleted?: boolean }> {
        try {
            if (!hasStock) {
                // Si has_stock=false, eliminar la fila para mantener tabla pequeña
                const deleted = await this.deleteRelation(productId, branchId);
                return { success: true, deleted };
            }

            // has_stock=true: hacer UPSERT
            const existing = await this.repo.findOne({
                where: { product_id: productId, branch_id: branchId }
            });

            if (existing) {
                // Actualizar
                await this.repo.update(
                    { product_id: productId, branch_id: branchId },
                    { has_stock: true, stock_qty: stockQty ?? null }
                );
            } else {
                // Insertar
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

    /**
     * Elimina la relación product-branch
     */
    async deleteRelation(productId: number, branchId: number): Promise<boolean> {
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

    /**
     * @deprecated Usar getProductsByBranchPaginated
     */
    async getProductsByBranch(branchId: number): Promise<ProductBranch[]> {
        try {
            const rows = await this.repo.find({
                where: { branch_id: branchId },
                relations: ['product']
            });

            return rows.map(row => new ProductBranch(
                row.product_id,
                row.branch_id,
                row.has_stock,
                row.stock_qty,
                row.updated_at,
                row.product?.name,
                row.product?.barcode,
                row.product?.sale_price
            ));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async setStock(
        productId: number,
        branchId: number,
        hasStock: boolean,
        stockQty?: number | null
    ): Promise<ProductBranch | null> {
        try {
            // Verificar si existe el registro
            let record = await this.repo.findOne({
                where: { product_id: productId, branch_id: branchId }
            });

            if (record) {
                // Actualizar
                await this.repo.update(
                    { product_id: productId, branch_id: branchId },
                    { has_stock: hasStock, stock_qty: stockQty ?? null }
                );
            } else {
                // Crear
                record = await this.repo.save({
                    product_id: productId,
                    branch_id: branchId,
                    has_stock: hasStock,
                    stock_qty: stockQty ?? null
                });
            }

            // Obtener el registro actualizado con relación
            const updated = await this.repo.findOne({
                where: { product_id: productId, branch_id: branchId },
                relations: ['product']
            });

            if (!updated) return null;

            return new ProductBranch(
                updated.product_id,
                updated.branch_id,
                updated.has_stock,
                updated.stock_qty,
                updated.updated_at,
                updated.product?.name,
                updated.product?.barcode,
                updated.product?.sale_price
            );
        } catch (error) {
            console.log(error);
            return null;
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
