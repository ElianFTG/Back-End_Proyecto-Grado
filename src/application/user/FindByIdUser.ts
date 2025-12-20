import { User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";
import { UserNotFound } from "../../domain/errors/user/UserNotFound";


export class FindByIdUser {
    constructor(private repository: UserRepository) {}

    async run(id: number) : Promise<User | null> {
        const user = await this.repository.findById(id)
        if(!user) throw new UserNotFound("User not found");

        return user;

    }
}