import { User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";
import bcrypt from "bcryptjs";
import { config } from 'dotenv';

config();


export class CreateUser {
    constructor(private repository: UserRepository) {}
    async run(
        ci: string,
        names: string,
        lastName: string,
        secondLastName: string,
        role: string,
        branchId: number,
        userName: string,
        password: string,
        userId: number,
        
    ) : Promise<User | null> {
        const passwordHashed = await bcrypt.hash(password, Number(process.env.SALT));
        return this.repository.create(
            new User(
                ci,
                names,
                lastName,
                secondLastName,
                role,
                branchId,
                userName
            ),
            passwordHashed,
            userId
        );
    }

}