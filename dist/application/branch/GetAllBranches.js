"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllBranches = void 0;
class GetAllBranches {
    constructor(repository) {
        this.repository = repository;
    }
    async run() {
        return this.repository.getAll();
    }
}
exports.GetAllBranches = GetAllBranches;
//# sourceMappingURL=GetAllBranches.js.map