import { User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";

export class GetUsers {
    constructor(private repository: UserRepository) {}

    async run(): Promise<User[]> {
        return this.repository.getUsers()
    }
}
