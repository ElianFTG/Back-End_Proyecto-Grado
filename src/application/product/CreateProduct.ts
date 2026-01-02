import { Product, SalePrice } from "../../domain/product/Product";
import { ProductRepository } from "../../domain/product/ProductRepository";

export class CreateProduct {
    constructor(
        private repository: ProductRepository
    ) {}

    async run(
        name: string,
        salePrice: SalePrice,
        categoryId: number,
        brandId: number,
        userId: number,
        barcode?: string | null,
        internalCode?: string | null,
        presentationId?: number | null,
        colorId?: number | null,
        
    ): Promise<Product | null> {
        const product = await this.repository.create(
            new Product(
                name,
                salePrice,
                categoryId,
                brandId,
                userId,
                barcode ?? null,
                internalCode ?? null,
                presentationId ?? null,
                colorId ?? null
            )
        );

        // Ya NO inicializamos stock en todas las sucursales (escalabilidad)
        // Las filas en product_branches se crean solo cuando se setea has_stock=true

        return product;
    }
}
