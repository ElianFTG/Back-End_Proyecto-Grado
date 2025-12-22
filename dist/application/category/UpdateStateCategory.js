"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStateCategory = void 0;
class UpdateStateCategory {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, userId) {
        return this.repository.updateState(id, userId);
    }
}
exports.UpdateStateCategory = UpdateStateCategory;
//# sourceMappingURL=UpdateStateCategory.js.map