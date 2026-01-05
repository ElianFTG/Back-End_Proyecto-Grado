import { PaginatedProductsResult, ProductRepository } from "../../domain/product/ProductRepository";

export class GetAllProducts {
    constructor(private repository: ProductRepository) {}

    async run(filters: { categoryId?: number; brandId?: number; state?: boolean; page?: number; limit?: number; }): Promise<PaginatedProductsResult> {
        return this.repository.getAll(filters);
    }
}
