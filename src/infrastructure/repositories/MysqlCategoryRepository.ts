import { CategoryRepository } from "../../domain/category/CategoryRepository";
import { Category } from "../../domain/category/Category";
import { Repository, QueryDeepPartialEntity } from 'typeorm';
import { CategoryEntity } from "../persistence/typeorm/entities";
import { AppDataSource } from "../db/Mysql";

export class MysqlCategoryRepository implements CategoryRepository {
    private readonly repo: Repository<CategoryEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(CategoryEntity);
    }

    async getAll(): Promise<Category[]> {
        try {
            const rows = await this.repo.find({
                where: { state: true },
                order: { id: "DESC" }
            });
            return rows.map((row) => new Category(
                row.name,
                row.description,
                row.user_id,
                row.state,
                row.id,
            ));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async create(category: Category): Promise<Category | null> {
        try {
            const row = await this.repo.save({
                name: category.name,
                description: category.description,
                user_id: category.userId,
            });
            return new Category(
                row.name,
                row.description,
                row.user_id,
                row.state,
                row.id,
            );
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async findById(id: number): Promise<Category | null> {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row) return null;
            return new Category(
                row.name,
                row.description,
                row.user_id,
                row.state,
                row.id,
            );
        } catch (error) {
            return null;
        }
    }

    async update(id: number, category: Partial<Category>, userId: number): Promise<Category | null> {
        try {
            const patch: QueryDeepPartialEntity<CategoryEntity> = {
                ...(category.name !== undefined ? { name: category.name } : {}),
                ...(category.description !== undefined ? { description: category.description } : {}),
                user_id: userId,
            };
            await this.repo.update({ id }, patch);
            const updatedCategory = await this.repo.findOneBy({ id });

            if (!updatedCategory) return null;

            return new Category(
                updatedCategory.name,
                updatedCategory.description,
                updatedCategory.user_id,
                updatedCategory.state,
                updatedCategory.id,

            );
        } catch (error) {
            return null;
        }
    }

    async updateState(id: number, user_id: number): Promise<void> {
        try {
            await this.repo.update({ id }, { state: false, user_id });
        } catch (error) {
            throw error;
        }
    }
}
