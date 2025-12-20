import { User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";



export class UpdateUser {
    constructor(private repository: UserRepository) {}

    async run(id: number,user: Partial<User>, userId: number): Promise<User | null>{
        return this.repository.update(id, user, userId);
    }
}