import { ProductBranch } from "./ProductBranch";
import { ProductBranchFilters, PaginatedBranchProducts, ProductWithBranchInfo } from "./ProductBranchFilters";

export interface ProductBranchRepository {
    getProductsByBranchPaginated(filters: ProductBranchFilters): Promise<PaginatedBranchProducts<ProductWithBranchInfo>>;
    upsertStock(productId: number, branchId: number, hasStock: boolean, stockQty?: number | null): Promise<{ success: boolean; deleted?: boolean }>;
    findByProductAndBranch(productId: number, branchId: number): Promise<ProductBranch | null>;
}
