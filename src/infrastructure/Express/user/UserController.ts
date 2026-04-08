import { Request, Response } from "express";
import { UserServiceContainer } from "../../../shared/service_containers/user/UserServiceContainer";
import { User } from "../../../domain/user/User";
import { InsufficientPermissionsError } from "../../../domain/user/RolePermissions";

export class UserController {
    async getUsers(req: Request, res: Response) {
        const users = await UserServiceContainer.user.getUsers.run();
        if (!users) return res.json([]).status(500)
        return res.json(users).status(200)
    }

    async create(req: Request, res: Response) {
        try {
            const { ci, names, lastName, secondLastName, role, branchId, email, userId } = req.body;
            const actorRole = req.auth?.role;

            const user = await UserServiceContainer.user.create.run(
                ci,
                names,
                lastName,
                secondLastName,
                role,
                branchId,
                email,
                userId,
                actorRole
            );
            if (!user) return res.status(500).json({ message: 'No se pudo crear el usuario' });
            return res.status(201).json(user);
        } catch (error) {
            if (error instanceof InsufficientPermissionsError) {
                return res.status(403).json({ message: error.message });
            }
            if (error instanceof Error) {
                if (error.message.includes('Ya existe')) {
                    return res.status(400).json({ message: error.message });
                }
            }
            console.error('Error creating user:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    async update(req: Request, res: Response){
        try {
            const body = req.body ?? {};
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }
            const userId = body.user_id;
            const actorRole = req.auth?.role;
            const targetCurrentRole = body.targetCurrentRole; 
            
            const userPatch: Partial<User> = {
                ci: body.ci,
                names: body.names,
                lastName: body.lastName,
                secondLastName: body.secondLastName,
                role: body.role,
                branchId: body.branchId,
                userName: body.userName,
            };
            const updatedUser = await UserServiceContainer.user.update.run(
                id, 
                userPatch, 
                userId,
                actorRole,
                targetCurrentRole
            );
            return res.status(200).json(updatedUser);
        } catch (error) {
            if (error instanceof InsufficientPermissionsError) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    async updateState(req: Request, res: Response){
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }
            const userId = Number(req.body.user_id);
            const actorRole = req.auth?.role;
            const targetRole = req.body.targetRole; 
            
            await UserServiceContainer.user.updateState.run(id, userId, actorRole, targetRole);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof InsufficientPermissionsError) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    async resetPassword(req: Request, res: Response){
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
        const body = req.body ?? {};
        const actorId = req.auth?.userId ?? body.user_id;
        const success = await UserServiceContainer.user.resetPassword.run(id, actorId);
        if (!success) {
            return res.status(500).json({ message: 'No se pudo resetear la contraseña' });
        }
        return res.status(204).send();
    }

    async updatePassword(req: Request, res: Response){
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
        const body = req.body ?? {};
        const newPassword = body.password;
        const actorId = req.auth?.userId ?? body.user_id;
        if (!newPassword) return res.status(400).json({ message: 'Password requerido' });
        const success = await UserServiceContainer.user.updatePassword.run(id, newPassword, actorId);
        if (!success) return res.status(500).json({ message: 'No se pudo actualizar la contraseña' });
        return res.status(204).send();
    }

    async findByCi(req: Request, res: Response){
        const rawCi = req.params.ci;
        const ci = Array.isArray(rawCi) ? rawCi[0] : (rawCi !== undefined && rawCi !== null ? String(rawCi) : '');
        if (!ci) {
            return res.status(400).json({ message: 'CI inválido' });
        }
        try {
            const user = await UserServiceContainer.user.findByCi.run(ci);
            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json(null);
        }
    }

    async findById(req: Request, res: Response){
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        try {
            const user = await UserServiceContainer.user.findById.run(id);
            return res.json(user).status(200);
        } catch (error) {
            return res.json().status(404);
        }
    }

    async changeFirstLoginPassword(req: Request, res: Response) {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                return res.status(401).json({ message: 'No autorizado' });
            }

            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' });
            }

            const result = await UserServiceContainer.user.changeFirstLoginPassword.run(
                userId,
                currentPassword,
                newPassword
            );

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            return res.status(200).json({ message: result.message });
        } catch (error) {
            console.error('Error changing first login password:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}
