import { SupplierRepository } from "../../domain/supplier/SupplierRepository";

export class UpdateStateSupplier {
    constructor(private repository: SupplierRepository) {}

    async run(id: number, userId: number): Promise<void> {
        return this.repository.updateState(id, userId);
    }
}
