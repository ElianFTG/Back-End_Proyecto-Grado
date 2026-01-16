import { Request,Response } from "express";
import * as express from "express";
import { UserNotFound } from "../../../domain/errors/user/UserNotFound";
import { UserServiceContainer } from "../../../shared/service_containers/user/UserServiceContainer";
import { User } from "../../../domain/user/User";

export class UserController {
    async getUsers(req: Request, res: Response){
        const users = await UserServiceContainer.user.getUsers.run();
        if(!users) return res.json([]).status(500)
        return res.json(users).status(200)
    }

    async create(req: Request, res: Response){
        const { username, ci, password, names, lastName, secondLastName, role, branchId, userId } = req.body;
        const user = await UserServiceContainer.user.create.run(
            ci, 
            names, 
            lastName, 
            secondLastName,
            role,
            branchId,
            username,
            password,
            userId
        );
        if(!user) return res.json(null).status(500)
        return res.json(user).status(201)
    }

    async update(req: Request, res: Response){
        const body = req.body ?? {};
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const userId = body.user_id;
        const userPatch: Partial<User> = {
            ci: body.ci,
            names: body.names,
            lastName: body.lastName,
            secondLastName: body.secondLastName,
            role: body.role,
            branchId: body.branchId,
            userName: body.userName,
        };
        const updatedUser = await UserServiceContainer.user.update.run(id, userPatch, userId)
        return res.json(updatedUser).status(200)
    }

    async updateState(req: Request, res: Response){
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const userId = Number(req.body.user_id);
        await UserServiceContainer.user.updateState.run(id, userId);
        return res.json().status(204)
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

    async findByCi(req: express.Request, res: express.Response){
        const {ci} = req.params;
        if (!ci) {
            return res.status(400).json({ message: 'CI inválido' });
        }
        try {
            const user = await UserServiceContainer.user.findByCi.run(ci);
            return res.status(200).json(user);
        } catch (error) {
            return res.json().status(404);
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



    



}
