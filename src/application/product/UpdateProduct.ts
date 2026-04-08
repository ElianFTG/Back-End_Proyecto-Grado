import { Product } from "../../domain/product/Product";
import { ProductRepository } from "../../domain/product/ProductRepository";

export class UpdateProduct {
    constructor(private repository: ProductRepository) {}

    async run(id: number, product: Partial<Product>, userId: number): Promise<Product | null> {
        return this.repository.update(id, product, userId);
    }
}
