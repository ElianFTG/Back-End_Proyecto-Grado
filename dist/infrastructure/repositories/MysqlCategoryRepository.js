"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlCategoryRepository = void 0;
const Category_1 = require("../../domain/category/Category");
const entities_1 = require("../persistence/typeorm/entities");
const Mysql_1 = require("../db/Mysql");
class MysqlCategoryRepository {
    constructor() {
        this.repo = Mysql_1.AppDataSource.getRepository(entities_1.CategoryEntity);
    }
    async getAll() {
        try {
            const rows = await this.repo.find({
                where: { state: true },
                order: { id: "DESC" }
            });
            return rows.map((row) => new Category_1.Category(row.name, row.description, row.user_id, row.state, row.id));
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
    async create(category) {
        try {
            const row = await this.repo.save({
                name: category.name,
                description: category.description,
                user_id: category.userId,
            });
            return new Category_1.Category(row.name, row.description, row.user_id, row.state, row.id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async findById(id) {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row)
                return null;
            return new Category_1.Category(row.name, row.description, row.user_id, row.state, row.id);
        }
        catch (error) {
            return null;
        }
    }
    async update(id, category, userId) {
        try {
            const patch = {
                ...(category.name !== undefined ? { name: category.name } : {}),
                ...(category.description !== undefined ? { description: category.description } : {}),
                user_id: userId,
            };
            await this.repo.update({ id }, patch);
            const updatedCategory = await this.repo.findOneBy({ id });
            if (!updatedCategory)
                return null;
            return new Category_1.Category(updatedCategory.name, updatedCategory.description, updatedCategory.user_id, updatedCategory.state, updatedCategory.id);
        }
        catch (error) {
            return null;
        }
    }
    async updateState(id, user_id) {
        try {
            await this.repo.update({ id }, { state: false, user_id });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.MysqlCategoryRepository = MysqlCategoryRepository;
//# sourceMappingURL=MysqlCategoryRepository.js.map