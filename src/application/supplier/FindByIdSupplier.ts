import { Supplier } from "../../domain/supplier/Supplier";
import { SupplierRepository } from "../../domain/supplier/SupplierRepository";

export class FindByIdSupplier {
    constructor(private repository: SupplierRepository) {}

    async run(id: number): Promise<Supplier | null> {
        return this.repository.findById(id);
    }
}
