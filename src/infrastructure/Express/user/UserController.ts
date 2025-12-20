import { Request,Response } from "express";
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

}
