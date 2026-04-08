import { UserRepository } from "../../domain/user/UserRepository";
import { canDeleteRole, InsufficientPermissionsError } from "../../domain/user/RolePermissions";

export class UpdateStateUser {
    constructor(private repository: UserRepository) {}

    async run(
        id: number,
        user_id: number,
        actorRole?: string,
        targetRole?: string
    ): Promise<void> {
        if (actorRole && targetRole) {
            if (!canDeleteRole(actorRole, targetRole)) {
                throw new InsufficientPermissionsError(
                    `No tienes permisos para eliminar usuarios con rol "${targetRole}"`
                );
            }
        }
        
        return this.repository.updateState(id, user_id);
    }
}