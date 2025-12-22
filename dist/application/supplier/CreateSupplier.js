"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSupplier = void 0;
const Supplier_1 = require("../../domain/supplier/Supplier");
class CreateSupplier {
    constructor(repository) {
        this.repository = repository;
    }
    async run(nit, name, phone, countryId, address, contactName, userId) {
        return this.repository.create(new Supplier_1.Supplier(nit, name, phone, countryId, address, contactName, true, userId));
    }
}
exports.CreateSupplier = CreateSupplier;
//# sourceMappingURL=CreateSupplier.js.map