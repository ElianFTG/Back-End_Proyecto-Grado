import { Category } from "./Category";

export interface CategoryRepository {
    getAll(): Promise<Category[]>;
    create(category: Category): Promise<Category | null>;
    findById(id: number): Promise<Category | null>;
    update(id: number, category: Partial<Category>, userId: number): Promise<Category | null>;
    updateState(id: number, userId: number): Promise<void>;
}
