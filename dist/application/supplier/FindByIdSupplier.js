"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindByIdSupplier = void 0;
class FindByIdSupplier {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id) {
        return this.repository.findById(id);
    }
}
exports.FindByIdSupplier = FindByIdSupplier;
//# sourceMappingURL=FindByIdSupplier.js.map