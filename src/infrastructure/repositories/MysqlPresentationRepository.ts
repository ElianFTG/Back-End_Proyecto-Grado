import { PresentationRepository } from "../../domain/presentation/PresentationRepository";
import { Presentation } from "../../domain/presentation/Presentation";
import { Repository, QueryDeepPartialEntity } from 'typeorm';
import { PresentationEntity } from "../persistence/typeorm/entities";
import { AppDataSource } from "../db/Mysql";

export class MysqlPresentationRepository implements PresentationRepository {
    private readonly repo: Repository<PresentationEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(PresentationEntity);
    }

    async getAll(): Promise<Presentation[]> {
        try {
            const rows = await this.repo.find({
                where: { state: true },
                order: { name: "ASC" }
            });
            return rows.map((row) => new Presentation(
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

    async create(presentation: Presentation): Promise<Presentation | null> {
        try {
            const row = await this.repo.save({
                name: presentation.name,
                user_id: presentation.userId,
            });
            return new Presentation(
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

    async findById(id: number): Promise<Presentation | null> {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row) return null;
            return new Presentation(
                row.name,
                row.user_id,
                row.state,
                row.id,
            );
        } catch (error) {
            return null;
        }
    }

    async update(id: number, presentation: Partial<Presentation>, userId: number): Promise<Presentation | null> {
        try {
            const patch: QueryDeepPartialEntity<PresentationEntity> = {
                user_id: userId,
            };
            if (presentation.name !== undefined) patch.name = presentation.name;
            
            await this.repo.update({ id }, patch);
            const updated = await this.repo.findOneBy({ id });

            if (!updated) return null;

            return new Presentation(
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
