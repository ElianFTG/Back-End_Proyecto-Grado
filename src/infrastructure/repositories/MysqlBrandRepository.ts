import { BrandRepository } from "../../domain/brand/BrandRepository";
import { Brand } from "../../domain/brand/Brand";
import { Repository, QueryDeepPartialEntity } from 'typeorm';
import { BrandEntity } from "../persistence/typeorm/entities/BrandEntity";
import { AppDataSource } from "../db/Mysql";

export class MysqlBrandRepository implements BrandRepository {
    private readonly repo: Repository<BrandEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(BrandEntity);
    }

    async getAll(): Promise<Brand[]> {
        try {
            const rows = await this.repo.find({
                where: { state: true },
                order: { id: "DESC" }
            });
            return rows.map((row) => new Brand(
                row.name,
                row.user_id,
                row.state,
                row.id,
                row.created_at,
                row.updated_at
            ));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async create(brand: Brand): Promise<Brand | null> {
        try {
            const row = await this.repo.save({
                name: brand.name,
                user_id: brand.userId,
            });
            return new Brand(
                row.name,
                row.user_id,
                row.state,
                row.id,
                row.created_at,
                row.updated_at
            );
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async findById(id: number): Promise<Brand | null> {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row) return null;
            return new Brand(
                row.name,
                row.user_id,
                row.state,
                row.id,
                row.created_at,
                row.updated_at
            );
        } catch (error) {
            return null;
        }
    }

    async update(id: number, brand: Partial<Brand>, userId: number): Promise<Brand | null> {
        try {
            const patch: QueryDeepPartialEntity<BrandEntity> = {
                ...(brand.name !== undefined ? { name: brand.name } : {}),
                user_id: userId,
            };
            await this.repo.update({ id }, patch);
            const updatedBrand = await this.repo.findOneBy({ id });

            if (!updatedBrand) return null;

            return new Brand(
                updatedBrand.name,
                updatedBrand.user_id,
                updatedBrand.state,
                updatedBrand.id,
                updatedBrand.created_at,
                updatedBrand.updated_at
            );
        } catch (error) {
            return null;
        }
    }

    async updateState(id: number, user_id: number): Promise<void> {
        try {
            const brand = await this.repo.findOneBy({ id });
            if (brand) {
                await this.repo.update({ id }, { state: !brand.state, user_id });
            }
        } catch (error) {
            throw error;
        }
    }
}
