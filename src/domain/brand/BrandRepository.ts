import { Brand } from "./Brand";

export interface BrandRepository {
    getAll(): Promise<Brand[]>;
    create(brand: Brand): Promise<Brand | null>;
    findById(id: number): Promise<Brand | null>;
    update(id: number, brand: Partial<Brand>, userId: number): Promise<Brand | null>;
    updateState(id: number, userId: number): Promise<void>;
}
