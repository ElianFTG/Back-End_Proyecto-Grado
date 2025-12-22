"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBranch = void 0;
class UpdateBranch {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id, patch, userId) {
        return this.repository.update(id, patch, userId);
    }
}
exports.UpdateBranch = UpdateBranch;
//# sourceMappingURL=UpdateBranch.js.map