"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSupplier = void 0;
class UpdateSupplier {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, supplier, userId) {
        return this.repository.update(id, supplier, userId);
    }
}
exports.UpdateSupplier = UpdateSupplier;
//# sourceMappingURL=UpdateSupplier.js.map