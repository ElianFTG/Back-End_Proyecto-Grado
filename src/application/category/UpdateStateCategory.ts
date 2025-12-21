import { CategoryRepository } from "../../domain/category/CategoryRepository";

export class UpdateStateCategory {
    constructor(private repository: CategoryRepository) {}

    async run(id: number, userId: number): Promise<void> {
        return this.repository.updateState(id, userId);
    }
}
