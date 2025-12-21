import { Supplier } from "../../domain/supplier/Supplier";
import { SupplierRepository } from "../../domain/supplier/SupplierRepository";

export class CreateSupplier {
    constructor(private repository: SupplierRepository) {}

    async run(
        nit: string,
        name: string,
        phone: string,
        countryId: number,
        address: string,
        contactName: string,
        userId: number
    ): Promise<Supplier | null> {
        return this.repository.create(
            new Supplier(nit, name, phone, countryId, address, contactName, true, userId)
        );
    }
}
