import { Brand } from "../../domain/brand/Brand";
import { BrandRepository } from "../../domain/brand/BrandRepository";

export class GetAllBrands {
    constructor(private repository: BrandRepository) {}

    async run(): Promise<Brand[]> {
        return this.repository.getAll();
    }
}
