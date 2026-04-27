import { User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";
import { canCreateRole, InsufficientPermissionsError } from "../../domain/user/RolePermissions";
import { EmailService } from "../../domain/services/EmailService";
import bcrypt from "bcryptjs";
import { config } from 'dotenv';
import crypto from 'crypto';

config();

function generateUsername(name: string, lastName: string, ci: string): string {
    const firstInitial = name.charAt(0).toUpperCase();
    const secondInitial = lastName.charAt(0).toUpperCase();
    const ciClean = ci.replace(/[^a-zA-Z0-9]/g, '').trim();
    return `${firstInitial}${secondInitial}${ciClean}`;
}

export class CreateUser {
    constructor(
        private repository: UserRepository,
        private emailService?: EmailService
    ) {}
    
    async run(
        ci: string,
        names: string,
        lastName: string,
        secondLastName: string,
        role: string,
        branchId: number,
        email: string,
        userId: number,
        actorRole?: string,
    ): Promise<User | null> {
        if (actorRole) {
            if (!canCreateRole(actorRole, role)) {
                throw new InsufficientPermissionsError(
                    `No tienes permisos para crear usuarios con rol "${role}"`
                );
            }
        }

        let userName = generateUsername(names, lastName, ci);
        const tempPassword = crypto.randomBytes(3).toString('hex'); 
        
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const passwordHashed = await bcrypt.hash(tempPassword, salt);
        
        
        let suffix = 1;
        let authRecord = await this.repository.findByUserName(userName);
        const originalUserName = userName;
        
        while (authRecord) {
            userName = `${originalUserName}${suffix}`;
            authRecord = await this.repository.findByUserName(userName);
            suffix++;
        }

        const user = await this.repository.create(
            new User(
                ci,
                names,
                lastName,
                secondLastName,
                email || "",
                role,
                branchId,
                userName,
                true 
            ),
            passwordHashed,
            userId
        );

        if (user && email && this.emailService) {
            try {
                await this.emailService.sendCredentials(email, userName, tempPassword, names);
            } catch (error) {
                console.error("Error enviando credenciales por correo:", error);
            }
        }

        return user;
    }
}

