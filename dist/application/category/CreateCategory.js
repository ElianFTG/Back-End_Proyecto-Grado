"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategory = void 0;
const Category_1 = require("../../domain/category/Category");
class CreateCategory {
    constructor(repository) {
        this.repository = repository;
    }
    async run(name, description, userId) {
        return this.repository.create(new Category_1.Category(name, description, userId));
    }
}
exports.CreateCategory = CreateCategory;
//# sourceMappingURL=CreateCategory.js.map