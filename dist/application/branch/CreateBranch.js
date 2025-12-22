"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBranch = void 0;
const Branch_1 = require("../../domain/branch/Branch");
class CreateBranch {
    constructor(repository) {
        this.repository = repository;
    }
    async run(name, userId) {
        const branch = new Branch_1.Branch(name, true, userId ?? null);
        return this.repository.create(branch);
    }
}
exports.CreateBranch = CreateBranch;
//# sourceMappingURL=CreateBranch.js.map