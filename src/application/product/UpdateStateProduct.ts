import { ProductRepository } from "../../domain/product/ProductRepository";

export class UpdateStateProduct {
    constructor(private repository: ProductRepository) {}

    async run(id: number, userId: number): Promise<void> {
        return this.repository.updateState(id, userId);
    }
}
