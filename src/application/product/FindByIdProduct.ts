import { Product } from "../../domain/product/Product";
import { ProductRepository } from "../../domain/product/ProductRepository";

export class FindByIdProduct {
    constructor(private repository: ProductRepository) {}

    async run(id: number): Promise<Product | null> {
        return this.repository.findById(id);
    }
}
