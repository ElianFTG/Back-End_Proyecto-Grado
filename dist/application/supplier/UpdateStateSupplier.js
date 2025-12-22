"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStateSupplier = void 0;
class UpdateStateSupplier {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, userId) {
        return this.repository.updateState(id, userId);
    }
}
exports.UpdateStateSupplier = UpdateStateSupplier;
//# sourceMappingURL=UpdateStateSupplier.js.map