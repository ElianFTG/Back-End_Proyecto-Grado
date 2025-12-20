import { UserRepository } from "../../domain/user/UserRepository";

export class UpdateStateUser {
    constructor(private repository: UserRepository) {}

    async run(id: number, user_id: number): Promise<void>{
        return this.repository.updateState(id,user_id);
    }
}