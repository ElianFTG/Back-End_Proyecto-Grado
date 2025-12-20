import { User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";
import { UserNotFound } from "../../domain/errors/user/UserNotFound";


export class FindByCiUser {
    constructor(private repository: UserRepository) {}

    async run(ci: string): Promise<User | null> {
        const user = await this.repository.findByCi(ci)
        if(!user) throw new UserNotFound("User not found");

        return user;

    }
}