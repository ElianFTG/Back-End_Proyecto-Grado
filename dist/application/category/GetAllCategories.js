"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCategories = void 0;
class GetAllCategories {
    constructor(repository) {
        this.repository = repository;
    }
    async run() {
        return this.repository.getAll();
    }
}
exports.GetAllCategories = GetAllCategories;
//# sourceMappingURL=GetAllCategories.js.map