import { UserRepository } from "../../domain/user/UserRepository";
import { User } from "../../domain/user/User";
import { UserAuthRecord } from "../../domain/user/UserAuthRecord";
import { UserNotFound } from "../../domain/errors/user/UserNotFound";
import { Repository, Raw, QueryDeepPartialEntity, Unique } from 'typeorm';
import { UserEntity } from "../persistence/typeorm/entities";
import { AppDataSource } from "../db/Mysql"
import { error } from "console";

export class MysqlUserRepository implements UserRepository {
    repo: Repository<UserEntity>
    constructor() {
        this.repo = AppDataSource.getRepository(UserEntity);
    }

    async getUsers(): Promise<User[]> {
        try {
            const rows = await this.repo.find(
                {
                    select: { id: true, ci: true, names: true, last_name: true, second_last_name: true, role: true, branch_id: true, user_name: true },
                    where: { state: true },
                    order: { id: "DESC" }
                });
            return rows.map((row) => new User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id));
        } catch (err) {
            console.log(error)
            return [];
        }
    }


    async create(user: User, password: string, userId: number): Promise<User | null> {
        try {
            const row = await this.repo.save(
                {
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
            return new User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id);
        } catch (error) {
            console.log(error);
            return null;
        }

    }


    async findById(id: number): Promise<User | null> {
        try {
            const row = await this.repo.findOne({ where: { id, state: true } });
            if (!row) return null;
            return new User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id)
        } catch (error) {
            return null
        }
    }

    async findByCi(ci: string): Promise<User | null> {
        try {
            const ciNormalized = ci.trim();
            const row = await this.repo.createQueryBuilder('u')
                .where('LOWER(u.ci) = LOWER(:ci)', { ci: ciNormalized })
                .andWhere('u.state = :state', { state: true })
                .getOne();

            if (!row) return null;

            return  new User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id)
        } catch (error) {
            return null
        }
    }

    async update(id: number, user: Partial<User>, userId: number): Promise<User | null> {
        try {
            const patch: QueryDeepPartialEntity<UserEntity> = {
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

            if (!updatedUser) return null;

            return new User(updatedUser.ci, updatedUser.names, updatedUser.last_name, updatedUser.second_last_name, updatedUser.role, updatedUser.branch_id, updatedUser.user_name, updatedUser.id)
        } catch (error) {
            return null
        }

    }

    async updateState(id: number, user_id: number): Promise<void> {
        try {
            await this.repo.update({ id }, { state: false, user_id });
        } catch (error) {
            throw error;
        }
    }

    async findByUserName(userName: string): Promise<UserAuthRecord | null> {
        try {
            const row = await this.repo.findOne({
                where: {user_name : userName, state: true},
            })
            if (!row) return null;
            const foundUser = new User(row.ci, row.names, row.last_name, row.second_last_name, row.role, row.branch_id, row.user_name, row.id)
            const passwordHash = row.password;
            const state = row.state;
            
            return {user: foundUser, passwordHash, state};
        } catch (error) {
            return null;
        }
         
        
    }

}