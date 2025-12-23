import { UserRepository } from "../../domain/user/UserRepository";
import bcrypt from "bcryptjs";
import { config } from 'dotenv';

config();

export class UpdatePasswordUser {
    constructor(private repository: UserRepository) {}

    async run(id: number, newPassword: string, userId?: number): Promise<boolean>{
        const saltRounds = Number(process.env.SALT);
        const rounds = Number.isFinite(saltRounds) && saltRounds > 0 ? saltRounds : 10;
        const hashed = await bcrypt.hash(newPassword, rounds);
        const updated = await this.repository.updatePassword(id, hashed, userId);
        return !!updated;
    }
}
