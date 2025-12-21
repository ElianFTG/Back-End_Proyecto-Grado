import { Supplier } from "../../domain/supplier/Supplier";
import { SupplierRepository } from "../../domain/supplier/SupplierRepository";

export class GetAllSuppliers {
    constructor(private repository: SupplierRepository) {}

    async run(): Promise<Supplier[]> {
        return this.repository.getAll();
    }
}
