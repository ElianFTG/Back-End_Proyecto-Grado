import { Brand } from "../../domain/brand/Brand";
import { BrandRepository } from "../../domain/brand/BrandRepository";

export class FindByIdBrand {
    constructor(private repository: BrandRepository) {}

    async run(id: number): Promise<Brand | null> {
        return this.repository.findById(id);
    }
}
