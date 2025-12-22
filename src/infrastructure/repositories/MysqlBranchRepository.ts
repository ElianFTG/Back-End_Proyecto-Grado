import { BranchRepository } from "../../domain/branch/BranchRepository";
import { Branch } from "../../domain/branch/Branch";
import { Repository } from 'typeorm';
import { BranchEntity } from "../persistence/typeorm/entities";
import { AppDataSource } from "../db/Mysql";

export class MysqlBranchRepository implements BranchRepository {
    private readonly repo: Repository<BranchEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(BranchEntity);
    }

    async getAll(): Promise<Branch[]> {
        try {
            const rows = await this.repo.find({ order: { name: 'ASC' } });
            return rows.map(r => new Branch(r.name, r.state, r.user_id ?? null, r.id));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async findById(id: number): Promise<Branch | null> {
        try {
            const row = await this.repo.findOneBy({ id });
            if (!row) return null;
            return new Branch(row.name, row.state, row.user_id ?? null, row.id);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async create(branch: Branch): Promise<Branch | null> {
        try {
            const entity = this.repo.create({
                name: branch.name,
                state: branch.state,
                user_id: branch.userId ?? null,
            } as Partial<BranchEntity>);
            const saved = await this.repo.save(entity);
            return new Branch(saved.name, saved.state, saved.user_id ?? null, saved.id);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async update(id: number, patch: Partial<Branch>, userId?: number): Promise<Branch | null> {
        try {
            const row = await this.repo.findOneBy({ id });
            if (!row) return null;
            if (patch.name !== undefined) row.name = patch.name;
            if (patch.state !== undefined) row.state = patch.state;
            if (userId !== undefined) row.user_id = userId;
            const saved = await this.repo.save(row);
            return new Branch(saved.name, saved.state, saved.user_id ?? null, saved.id);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async updateState(id: number, userId?: number): Promise<void> {
        try {
            const row = await this.repo.findOneBy({ id });
            if (!row) return;
            row.state = !row.state;
            if (userId !== undefined) row.user_id = userId;
            await this.repo.save(row);
        } catch (error) {
            console.log(error);
        }
    }
}
