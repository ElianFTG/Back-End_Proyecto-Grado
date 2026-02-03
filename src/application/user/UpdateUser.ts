import { User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";
import { canEditRole, InsufficientPermissionsError } from "../../domain/user/RolePermissions";

export class UpdateUser {
    constructor(private repository: UserRepository) {}
    async run(
        id: number,
        user: Partial<User>,
        userId: number,
        actorRole?: string,
        targetCurrentRole?: string
    ): Promise<User | null> {
        if (actorRole && targetCurrentRole) {
            if (!canEditRole(actorRole, targetCurrentRole)) {
                throw new InsufficientPermissionsError(
                    `No tienes permisos para editar usuarios con rol "${targetCurrentRole}"`
                );
            }
        }
        
        if (actorRole && user.role) {
            if (!canEditRole(actorRole, user.role)) {
                throw new InsufficientPermissionsError(
                    `No tienes permisos para asignar el rol "${user.role}"`
                );
            }
        }
        
        return this.repository.update(id, user, userId);
    }
}