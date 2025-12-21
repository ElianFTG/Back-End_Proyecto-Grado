import { Supplier } from "../../domain/supplier/Supplier";
import { SupplierRepository } from "../../domain/supplier/SupplierRepository";

export class UpdateSupplier {
    constructor(private repository: SupplierRepository) {}

    async run(id: number, supplier: Partial<Supplier>, userId: number): Promise<Supplier | null> {
        return this.repository.update(id, supplier, userId);
    }
}
