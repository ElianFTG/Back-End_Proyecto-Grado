import { Category } from "../../domain/category/Category";
import { CategoryRepository } from "../../domain/category/CategoryRepository";

export class UpdateCategory {
    constructor(private repository: CategoryRepository) {}

    async run(id: number, category: Partial<Category>, userId: number): Promise<Category | null> {
        return this.repository.update(id, category, userId);
    }
}
