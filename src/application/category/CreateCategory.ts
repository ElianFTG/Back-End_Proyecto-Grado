import { Category } from "../../domain/category/Category";
import { CategoryRepository } from "../../domain/category/CategoryRepository";

export class CreateCategory {
    constructor(private repository: CategoryRepository) {}

    async run(
        name: string,
        description: string,
        userId: number
    ): Promise<Category | null> {
        return this.repository.create(
            new Category(name, description, userId)
        );
    }
}
