export class ProductBranch {
    productId: number;
    branchId: number;
    hasStock: boolean;
    stockQty: number | null;
    updatedAt?: Date | undefined;

    // Datos opcionales del producto para lectura
    productName?: string | undefined;
    productBarcode?: string | null | undefined;
    productSalePrice?: Record<string, number> | undefined;

    constructor(
        productId: number,
        branchId: number,
        hasStock: boolean = false,
        stockQty: number | null = null,
        updatedAt?: Date,
        productName?: string,
        productBarcode?: string | null,
        productSalePrice?: Record<string, number>
    ) {
        this.productId = productId;
        this.branchId = branchId;
        this.hasStock = hasStock;
        this.stockQty = stockQty;
        this.updatedAt = updatedAt;
        this.productName = productName;
        this.productBarcode = productBarcode;
        this.productSalePrice = productSalePrice;
    }
}
