"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlUserRepository = void 0;
const User_1 = require("../../domain/user/User");
const UserEntity_1 = require("../persistence/typeorm/entities/UserEntity");
const Mysql_1 = require("../db/Mysql");
const console_1 = require("console");
class MysqlUserRepository {
    constructor() {
        this.repo = Mysql_1.AppDataSource.getRepository(UserEntity_1.UserEntity);
    }
    async getUsers() {
        try {
            const rows = await this.repo.find({
                select: { id: true, ci: true, names: true, last_name: true, second_last_name: true, role: true, branch_id: true, user_name: true },
                where: { state: true },
                order: { id: "DESC" }
            });
            return rows.map((row) => new User_1.User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id));
        }
        catch (err) {
            console.log(console_1.error);
            return [];
        }
    }
    async create(user, password, userId) {
        try {
            const row = await this.repo.save({
                ci: user.ci,
                names: user.names,
                last_name: user.lastName,
                second_last_name: user.secondLastName,
                role: user.role,
                branch_id: user.branchId,
                user_name: user.userName,
                password: password,
                user_id: userId,
            });
            return new User_1.User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id);
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
            return new User_1.User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id);
        }
        catch (error) {
            return null;
        }
    }
    async findByCi(ci) {
        try {
            const ciNormalized = ci.trim();
            const row = await this.repo.createQueryBuilder('u')
                .where('LOWER(u.ci) = LOWER(:ci)', { ci: ciNormalized })
                .andWhere('u.state = :state', { state: true })
                .getOne();
            if (!row)
                return null;
            return new User_1.User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id);
        }
        catch (error) {
            return null;
        }
    }
    async update(id, user, userId) {
        try {
            const patch = {
                ...(user.ci !== undefined ? { ci: user.ci } : {}),
                ...(user.names !== undefined ? { names: user.names } : {}),
                ...(user.lastName !== undefined ? { last_name: user.lastName } : {}),
                ...(user.secondLastName !== undefined ? { second_last_name: user.secondLastName } : {}),
                ...(user.role !== undefined ? { role: user.role } : {}),
                ...(user.branchId !== undefined ? { branch_id: user.branchId } : {}),
                ...(user.userName !== undefined ? { user_name: user.userName } : {}),
                user_id: userId,
            };
            await this.repo.update({ id }, patch);
            const updatedUser = await this.repo.findOneBy({ id });
            if (!updatedUser)
                return null;
            return new User_1.User(updatedUser.ci, updatedUser.names, updatedUser.last_name, updatedUser.second_last_name, updatedUser.role, updatedUser.branch_id, updatedUser.user_name, updatedUser.id);
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
    async updatePassword(id, passwordHash, userId) {
        try {
            const patch = {
                password: passwordHash,
                ...(userId !== undefined ? { user_id: userId } : {}),
            };
            await this.repo.update({ id }, patch);
            const updated = await this.repo.findOneBy({ id });
            if (!updated)
                return null;
            return new User_1.User(updated.ci, updated.names, updated.last_name, updated.second_last_name, updated.role, updated.branch_id, updated.user_name, updated.id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async resetPassword(id, passwordHash, adminId) {
        try {
            // In reset we persist the hash and record which admin performed the reset (user_id)
            const patch = {
                password: passwordHash,
                ...(adminId !== undefined ? { user_id: adminId } : {}),
            };
            await this.repo.update({ id }, patch);
            const updated = await this.repo.findOneBy({ id });
            if (!updated)
                return null;
            return new User_1.User(updated.ci, updated.names, updated.last_name, updated.second_last_name, updated.role, updated.branch_id, updated.user_name, updated.id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async findByUserName(userName) {
        try {
            const row = await this.repo.findOne({
                where: { user_name: userName, state: true },
            });
            if (!row)
                return null;
            const foundUser = new User_1.User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id);
            const passwordHash = row.password;
            const state = row.state;
            return { user: foundUser, passwordHash, state };
        }
        catch (error) {
            return null;
        }
    }
}
exports.MysqlUserRepository = MysqlUserRepository;
//# sourceMappingURL=MysqlUserRepository.js.map