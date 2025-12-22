"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryServiceContainer = void 0;
const CreateCategory_1 = require("../../../application/category/CreateCategory");
const GetAllCategories_1 = require("../../../application/category/GetAllCategories");
const FindByIdCategory_1 = require("../../../application/category/FindByIdCategory");
const UpdateCategory_1 = require("../../../application/category/UpdateCategory");
const UpdateStateCategory_1 = require("../../../application/category/UpdateStateCategory");
const MysqlCategoryRepository_1 = require("../../../infrastructure/repositories/MysqlCategoryRepository");
const CategoryRepository = new MysqlCategoryRepository_1.MysqlCategoryRepository();
exports.CategoryServiceContainer = {
    category: {
        getAll: new GetAllCategories_1.GetAllCategories(CategoryRepository),
        create: new CreateCategory_1.CreateCategory(CategoryRepository),
        findById: new FindByIdCategory_1.FindByIdCategory(CategoryRepository),
        update: new UpdateCategory_1.UpdateCategory(CategoryRepository),
        updateState: new UpdateStateCategory_1.UpdateStateCategory(CategoryRepository),
    }
};
//# sourceMappingURL=CategoryServiceContainer.js.map