import { Brand } from "../../domain/brand/Brand";
import { BrandRepository } from "../../domain/brand/BrandRepository";

export class CreateBrand {
    constructor(private repository: BrandRepository) {}

    async run(name: string, userId: number): Promise<Brand | null> {
        return this.repository.create(new Brand(name, userId));
    }
}
