"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategory = void 0;
class UpdateCategory {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, category, userId) {
        return this.repository.update(id, category, userId);
    }
}
exports.UpdateCategory = UpdateCategory;
//# sourceMappingURL=UpdateCategory.js.map