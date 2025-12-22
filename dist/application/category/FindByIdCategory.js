"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindByIdCategory = void 0;
class FindByIdCategory {
    constructor(repository) {
        this.repository = repository;
    }
    async run(id) {
        return this.repository.findById(id);
    }
}
exports.FindByIdCategory = FindByIdCategory;
//# sourceMappingURL=FindByIdCategory.js.map