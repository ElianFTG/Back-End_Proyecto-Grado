import { BrandRepository } from "../../domain/brand/BrandRepository";

export class UpdateStateBrand {
    constructor(private repository: BrandRepository) {}

    async run(id: number, userId: number): Promise<void> {
        return this.repository.updateState(id, userId);
    }
}
