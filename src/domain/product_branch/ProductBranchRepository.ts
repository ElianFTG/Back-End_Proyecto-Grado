import { ProductBranch } from "./ProductBranch";
import { ProductBranchFilters, PaginatedBranchProducts, ProductWithBranchInfo } from "./ProductBranchFilters";

export interface ProductBranchRepository {
    getProductsByBranchPaginated(filters: ProductBranchFilters): Promise<PaginatedBranchProducts<ProductWithBranchInfo>>;
    getProductsByBranch(branchId: number): Promise<ProductBranch[]>;
    upsertStock(productId: number, branchId: number, hasStock: boolean, stockQty?: number | null): Promise<{ success: boolean; deleted?: boolean }>;
    deleteRelation(productId: number, branchId: number): Promise<boolean>;
    setStock(productId: number, branchId: number, hasStock: boolean, stockQty?: number | null): Promise<ProductBranch | null>;
    findByProductAndBranch(productId: number, branchId: number): Promise<ProductBranch | null>;
}
