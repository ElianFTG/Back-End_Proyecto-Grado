import { UserRepository } from "../../domain/user/UserRepository";
import bcrypt from "bcryptjs";
import { config } from 'dotenv';

config();

export class ResetPasswordUser {
    constructor(private repository: UserRepository) {}

    async run(id: number, userId?: number): Promise<boolean>{
        const user = await this.repository.findById(id);
        if (!user) return false;

        const lastName = user.lastName || '';
        const secondLast = user.secondLastName || '';
        const ci = user.ci || '';
        const first = lastName.trim().charAt(0).toLowerCase() || '';
        const second = secondLast.trim().charAt(0).toLowerCase() || '';
        const plain = `${first}.${second}${ci}`;
        const saltRounds = Number(process.env.SALT);
        const rounds = Number.isFinite(saltRounds) && saltRounds > 0 ? saltRounds : 10;

        const hashed = await bcrypt.hash(plain, rounds);
        const updated = await this.repository.resetPassword(id, hashed, userId);
        if (!updated) return false;
        return true;
    }
}
