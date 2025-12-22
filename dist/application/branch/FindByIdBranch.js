"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindByIdBranch = void 0;
class FindByIdBranch {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id) {
        return this.repository.findById(id);
    }
}
exports.FindByIdBranch = FindByIdBranch;
//# sourceMappingURL=FindByIdBranch.js.map