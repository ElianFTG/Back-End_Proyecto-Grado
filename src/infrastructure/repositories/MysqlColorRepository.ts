import { ColorRepository } from "../../domain/color/ColorRepository";
import { Color } from "../../domain/color/Color";
import { Repository, QueryDeepPartialEntity } from 'typeorm';
import { ColorEntity } from "../persistence/typeorm/entities";
import { AppDataSource } from "../db/Mysql";

export class MysqlColorRepository implements ColorRepository {
    private readonly repo: Repository<ColorEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(ColorEntity);
    }

    async getAll(): Promise<Color[]> {
        try {
            const rows = await this.repo.find({
                where: { state: true },
                order: { name: "ASC" }
            });
            return rows.map((row) => new Color(
                row.name,
                row.user_id,
                row.state,
                row.id,
            ));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async create(color: Color): Promise<Color | null> {
        try {
            const row = await this.repo.save({
                name: color.name,
                user_id: color.userId,
            });
            return new Color(
                row.name,
                row.user_id,
                row.state,
                row.id,
            );
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async findById(id: number): Promise<Color | null> {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row) return null;
            return new Color(
                row.name,
                row.user_id,
                row.state,
                row.id,
            );
        } catch (error) {
            return null;
        }
    }

    async update(id: number, color: Partial<Color>, userId: number): Promise<Color | null> {
        try {
            const patch: QueryDeepPartialEntity<ColorEntity> = {
                user_id: userId,
            };
            if (color.name !== undefined) patch.name = color.name;
            
            await this.repo.update({ id }, patch);
            const updated = await this.repo.findOneBy({ id });

            if (!updated) return null;

            return new Color(
                updated.name,
                updated.user_id,
                updated.state,
                updated.id,
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
