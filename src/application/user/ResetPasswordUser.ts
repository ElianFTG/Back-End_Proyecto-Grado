import { UserRepository } from "../../domain/user/UserRepository";
import bcrypt from "bcryptjs";
import { config } from 'dotenv';
import { EmailService } from "../../domain/services/EmailService";
import crypto from 'crypto';

config();

export class ResetPasswordUser {
    constructor(
        private repository: UserRepository,
        private emailService: EmailService
    ) { }

    async run(id: number, userId?: number): Promise<boolean> {
        const user = await this.repository.findById(id);
        if (!user) return false;

        const names = user.names || '';
        // const lastName = user.lastName || '';
        // const secondLast = user.secondLastName || '';
        // const ci = user.ci || '';
        const email = user.email || '';
        // const first = lastName.trim().charAt(0).toLowerCase() || '';
        // const second = secondLast.trim().charAt(0).toLowerCase() || '';
        // const plain = `${first}.${second}${ci}`;
        const saltRounds = Number(process.env.SALT);
        const rounds = Number.isFinite(saltRounds) && saltRounds > 0 ? saltRounds : 10;

        const tempPassword = crypto.randomBytes(3).toString('hex');

        const hashed = await bcrypt.hash(tempPassword, rounds);
        const updated = await this.repository.resetPassword(id, hashed, userId);
        if (!updated) return false;
        try {
            await this.emailService.sendPasswordReseted(email, tempPassword, names);
        } catch (error) {
            console.error("Error enviando credenciales por correo:", error);
        }
        return true;
    }
}
