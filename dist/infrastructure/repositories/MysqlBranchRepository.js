"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlBranchRepository = void 0;
const Branch_1 = require("../../domain/branch/Branch");
const entities_1 = require("../persistence/typeorm/entities");
const Mysql_1 = require("../db/Mysql");
class MysqlBranchRepository {
    constructor() {
        this.repo = Mysql_1.AppDataSource.getRepository(entities_1.BranchEntity);
    }
    async getAll() {
        try {
            const rows = await this.repo.find({ order: { name: 'ASC' } });
            return rows.map(r => new Branch_1.Branch(r.name, r.state, r.user_id ?? null, r.id));
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
    async findById(id) {
        try {
            const row = await this.repo.findOneBy({ id });
            if (!row)
                return null;
            return new Branch_1.Branch(row.name, row.state, row.user_id ?? null, row.id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async create(branch) {
        try {
            const entity = this.repo.create({
                name: branch.name,
                state: branch.state,
                user_id: branch.userId ?? null,
            });
            const saved = await this.repo.save(entity);
            return new Branch_1.Branch(saved.name, saved.state, saved.user_id ?? null, saved.id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async update(id, patch, userId) {
        try {
            const row = await this.repo.findOneBy({ id });
            if (!row)
                return null;
            if (patch.name !== undefined)
                row.name = patch.name;
            if (patch.state !== undefined)
                row.state = patch.state;
            if (userId !== undefined)
                row.user_id = userId;
            const saved = await this.repo.save(row);
            return new Branch_1.Branch(saved.name, saved.state, saved.user_id ?? null, saved.id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async updateState(id, userId) {
        try {
            const row = await this.repo.findOneBy({ id });
            if (!row)
                return;
            row.state = !row.state;
            if (userId !== undefined)
                row.user_id = userId;
            await this.repo.save(row);
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.MysqlBranchRepository = MysqlBranchRepository;
//# sourceMappingURL=MysqlBranchRepository.js.map