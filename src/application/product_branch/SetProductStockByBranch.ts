import { ProductBranchRepository } from "../../domain/product_branch/ProductBranchRepository";

export interface SetStockResult {
    success: boolean;
    hasStock: boolean;
    stockQty: number | null;
    deleted: boolean;
}

export class SetProductStockByBranch {
    constructor(private repository: ProductBranchRepository) {}

    async run(
        productId: number,
        branchId: number,
        hasStock: boolean,
        stockQty?: number | null
    ): Promise<SetStockResult> {
        const result = await this.repository.upsertStock(productId, branchId, hasStock, stockQty);
        return {
            success: result.success,
            hasStock: result.deleted ? false : hasStock,
            stockQty: result.deleted ? null : (stockQty ?? null),
            deleted: result.deleted ?? false
        };
    }
}
