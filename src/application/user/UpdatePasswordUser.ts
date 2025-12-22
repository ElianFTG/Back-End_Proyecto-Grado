import { UserRepository } from "../../domain/user/UserRepository";
import bcrypt from "bcryptjs";
import { config } from 'dotenv';

config();

export class UpdatePasswordUser {
    constructor(private repository: UserRepository) {}

    async run(id: number, newPassword: string, userId?: number): Promise<boolean>{
        const hashed = await bcrypt.hash(newPassword, Number(process.env.SALT));
        const updated = await this.repository.updatePassword(id, hashed, userId);
        return !!updated;
    }
}
