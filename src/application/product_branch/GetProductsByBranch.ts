import { ProductBranchRepository } from "../../domain/product_branch/ProductBranchRepository";
import { ProductBranchFilters, PaginatedBranchProducts, ProductWithBranchInfo } from "../../domain/product_branch/ProductBranchFilters";

export class GetProductsByBranch {
    constructor(private repository: ProductBranchRepository) {}
    async runPaginated(filters: ProductBranchFilters): Promise<PaginatedBranchProducts<ProductWithBranchInfo>> {
        return this.repository.getProductsByBranchPaginated(filters);
    }
}
