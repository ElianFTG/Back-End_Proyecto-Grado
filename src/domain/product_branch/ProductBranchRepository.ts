import { ProductBranch } from "./ProductBranch";
import { ProductBranchFilters, PaginatedBranchProducts, ProductWithBranchInfo } from "./ProductBranchFilters";

export interface ProductBranchRepository {
    /**
     * @deprecated Ya no se usa - no crear filas al crear producto (escalabilidad)
     * Inicializa filas product_branches para un producto en todas las sucursales activas
     */
    initializeForProduct(productId: number): Promise<void>;

    /**
     * @deprecated Usar getProductsByBranchPaginated para grandes volúmenes
     * Obtiene productos con stock para una sucursal
     */
    getProductsByBranch(branchId: number): Promise<ProductBranch[]>;

    /**
     * Obtiene productos paginados con filtros para una sucursal.
     * Si onlyAvailable=true: solo productos con has_stock=true en esa sucursal.
     * Si onlyAvailable=false: todos los productos activos con LEFT JOIN (has_stock=false si no hay fila).
     */
    getProductsByBranchPaginated(filters: ProductBranchFilters): Promise<PaginatedBranchProducts<ProductWithBranchInfo>>;

    /**
     * UPSERT: Si has_stock=true, inserta o actualiza la fila.
     * Si has_stock=false, elimina la fila (para mantener la tabla pequeña).
     */
    upsertStock(productId: number, branchId: number, hasStock: boolean, stockQty?: number | null): Promise<{ success: boolean; deleted?: boolean }>;

    /**
     * Elimina la relación product-branch (usado cuando has_stock=false)
     */
    deleteRelation(productId: number, branchId: number): Promise<boolean>;

    /**
     * Setea has_stock y stock_qty para un producto en una sucursal
     */
    setStock(productId: number, branchId: number, hasStock: boolean, stockQty?: number | null): Promise<ProductBranch | null>;

    /**
     * Obtiene el registro de stock para un producto y sucursal
     */
    findByProductAndBranch(productId: number, branchId: number): Promise<ProductBranch | null>;
}
