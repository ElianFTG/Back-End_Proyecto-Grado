import { ProductBranch } from "../../domain/product_branch/ProductBranch";
import { ProductBranchRepository } from "../../domain/product_branch/ProductBranchRepository";

export class SetProductStockByBranch {
    constructor(private repository: ProductBranchRepository) {}

    /**
     * Método legacy que mantiene compatibilidad
     */
    async run(
        productId: number,
        branchId: number,
        hasStock: boolean,
        stockQty?: number | null
    ): Promise<ProductBranch | null> {
        return this.repository.setStock(productId, branchId, hasStock, stockQty);
    }

    /**
     * UPSERT optimizado: 
     * - Si has_stock=true: inserta o actualiza
     * - Si has_stock=false: elimina la fila (mantiene tabla pequeña)
     */
    async runOptimized(
        productId: number,
        branchId: number,
        hasStock: boolean,
        stockQty?: number | null
    ): Promise<{ success: boolean; deleted?: boolean }> {
        return this.repository.upsertStock(productId, branchId, hasStock, stockQty);
    }
}
