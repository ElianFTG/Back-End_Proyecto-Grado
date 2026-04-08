import { Brand } from "../../domain/brand/Brand";
import { BrandRepository } from "../../domain/brand/BrandRepository";

export class UpdateBrand {
    constructor(private repository: BrandRepository) {}

    async run(id: number, brand: Partial<Brand>, userId: number): Promise<Brand | null> {
        return this.repository.update(id, brand, userId);
    }
}
