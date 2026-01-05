import { Product } from "./Product";

export interface PaginatedProductsResult {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProductRepository {
    getAll(filters: { categoryId?: number; brandId?: number; state?: boolean; page?: number; limit?: number; }): Promise<PaginatedProductsResult>;
    create(product: Product): Promise<Product | null>;
    findById(id: number): Promise<Product | null>;
    update(id: number, product: Partial<Product>, userId: number): Promise<Product | null>;
    updateState(id: number, userId: number): Promise<void>;
}
