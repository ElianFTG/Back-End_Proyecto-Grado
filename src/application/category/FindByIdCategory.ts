import { Category } from "../../domain/category/Category";
import { CategoryRepository } from "../../domain/category/CategoryRepository";

export class FindByIdCategory {
    constructor(private repository: CategoryRepository) {}

    async run(id: number): Promise<Category | null> {
        return this.repository.findById(id);
    }
}
