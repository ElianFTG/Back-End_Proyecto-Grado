import { Category } from "../../domain/category/Category";
import { CategoryRepository } from "../../domain/category/CategoryRepository";

export class GetAllCategories {
    constructor(private repository: CategoryRepository) {}

    async run(): Promise<Category[]> {
        return this.repository.getAll();
    }
}
