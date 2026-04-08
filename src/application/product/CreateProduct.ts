import { Product, ProductPrice } from "../../domain/product/Product";
import { ProductRepository } from "../../domain/product/ProductRepository";

export class CreateProduct {
    constructor(
        private repository: ProductRepository
    ) {}

    async run(
        name: string,
        prices: ProductPrice[],
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
                prices,
                categoryId,
                brandId,
                userId,
                barcode ?? null,
                internalCode ?? null,
                presentationId ?? null,
                colorId ?? null
            )
        );

        return product;
    }
}
