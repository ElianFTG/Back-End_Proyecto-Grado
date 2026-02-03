import { UserRepository } from "../../domain/user/UserRepository";
import bcrypt from "bcryptjs";
import { config } from 'dotenv';

config();

export class ChangeFirstLoginPassword {
    constructor(private repository: UserRepository) {}

    async run(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<{ success: boolean; message: string }> {
        const user = await this.repository.findById(userId);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        if (!user.isFirstLogin) {
            return { success: false, message: 'Este endpoint solo es para el primer inicio de sesión' };
        }

        const authRecord = await this.repository.findByUserName(user.userName);
        if (!authRecord) {
            return { success: false, message: 'Error al verificar credenciales' };
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, authRecord.passwordHash);
        if (!isCurrentPasswordValid) {
            return { success: false, message: 'La contraseña actual es incorrecta' };
        }

        if (currentPassword === newPassword) {
            return { success: false, message: 'La nueva contraseña debe ser diferente a la temporal' };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, Number(process.env.SALT));

        const updatedUser = await this.repository.updatePassword(userId, newPasswordHash);
        if (!updatedUser) {
            return { success: false, message: 'Error al actualizar la contraseña' };
        }

        const firstLoginUpdated = await this.repository.setFirstLoginComplete(userId);
        if (!firstLoginUpdated) {
            return { success: false, message: 'Error al completar el proceso de primer inicio' };
        }

        return { success: true, message: 'Contraseña actualizada correctamente' };
    }
}
