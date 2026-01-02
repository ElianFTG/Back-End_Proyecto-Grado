import { ProductBranch } from "../../domain/product_branch/ProductBranch";
import { ProductBranchRepository } from "../../domain/product_branch/ProductBranchRepository";
import { ProductBranchFilters, PaginatedBranchProducts, ProductWithBranchInfo } from "../../domain/product_branch/ProductBranchFilters";

export class GetProductsByBranch {
    constructor(private repository: ProductBranchRepository) {}

    /**
     * @deprecated Usar runPaginated para grandes volúmenes
     */
    async run(branchId: number): Promise<ProductBranch[]> {
        return this.repository.getProductsByBranch(branchId);
    }

    /**
     * Consulta paginada y optimizada para grandes volúmenes de productos
     */
    async runPaginated(filters: ProductBranchFilters): Promise<PaginatedBranchProducts<ProductWithBranchInfo>> {
        return this.repository.getProductsByBranchPaginated(filters);
    }
}
