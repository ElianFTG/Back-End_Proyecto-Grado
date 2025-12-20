import { User } from "./User";
import { UserAuthRecord } from "./UserAuthRecord";
export interface UserRepository {
    getUsers(): Promise<User[]>
    create(user: User, password: string ,userId: number): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findByCi(ci: string): Promise<User | null>;
    update(id: number,user: Partial<User>, userId: number ): Promise<User | null>;
    updateState(id: number,userId: number): Promise<void>;
    findByUserName(userName: string): Promise<UserAuthRecord | null>;
}