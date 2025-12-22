"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllSuppliers = void 0;
class GetAllSuppliers {
    constructor(repository) {
        this.repository = repository;
    }
    async run() {
        return this.repository.getAll();
    }
}
exports.GetAllSuppliers = GetAllSuppliers;
//# sourceMappingURL=GetAllSuppliers.js.map