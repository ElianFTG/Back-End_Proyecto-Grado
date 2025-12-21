import { CreateCategory } from "../../../application/category/CreateCategory";
import { GetAllCategories } from "../../../application/category/GetAllCategories";
import { FindByIdCategory } from "../../../application/category/FindByIdCategory";
import { UpdateCategory } from "../../../application/category/UpdateCategory";
import { UpdateStateCategory } from "../../../application/category/UpdateStateCategory";
import { MysqlCategoryRepository } from "../../../infrastructure/repositories/MysqlCategoryRepository";

const CategoryRepository = new MysqlCategoryRepository();

export const CategoryServiceContainer = {
    category: {
        getAll: new GetAllCategories(CategoryRepository),
        create: new CreateCategory(CategoryRepository),
        findById: new FindByIdCategory(CategoryRepository),
        update: new UpdateCategory(CategoryRepository),
        updateState: new UpdateStateCategory(CategoryRepository),
    }
}
