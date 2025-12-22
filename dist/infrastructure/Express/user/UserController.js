"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserServiceContainer_1 = require("../../../shared/service_containers/user/UserServiceContainer");
class UserController {
    async getUsers(req, res) {
        const users = await UserServiceContainer_1.UserServiceContainer.user.getUsers.run();
        if (!users)
            return res.json([]).status(500);
        return res.json(users).status(200);
    }
    async create(req, res) {
        const { username, ci, password, names, lastName, secondLastName, role, branchId, userId } = req.body;
        const user = await UserServiceContainer_1.UserServiceContainer.user.create.run(ci, names, lastName, secondLastName, role, branchId, username, password, userId);
        if (!user)
            return res.json(null).status(500);
        return res.json(user).status(201);
    }
    async update(req, res) {
        const body = req.body ?? {};
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const userId = body.user_id;
        const userPatch = {
            ci: body.ci,
            names: body.names,
            lastName: body.lastName,
            secondLastName: body.secondLastName,
            role: body.role,
            branchId: body.branchId,
            userName: body.userName,
        };
        const updatedUser = await UserServiceContainer_1.UserServiceContainer.user.update.run(id, userPatch, userId);
        return res.json(updatedUser).status(200);
    }
    async updateState(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const userId = Number(req.body.user_id);
        await UserServiceContainer_1.UserServiceContainer.user.updateState.run(id, userId);
        return res.json().status(204);
    }
    async resetPassword(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const body = req.body ?? {};
        const actorId = req.auth?.userId ?? body.user_id;
        const success = await UserServiceContainer_1.UserServiceContainer.user.resetPassword.run(id, actorId);
        if (!success)
            return res.status(500).json({ message: 'No se pudo resetear la contraseña' });
        return res.status(204).send();
    }
    async updatePassword(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const body = req.body ?? {};
        const newPassword = body.password;
        const actorId = req.auth?.userId ?? body.user_id;
        if (!newPassword)
            return res.status(400).json({ message: 'Password requerido' });
        const success = await UserServiceContainer_1.UserServiceContainer.user.updatePassword.run(id, newPassword, actorId);
        if (!success)
            return res.status(500).json({ message: 'No se pudo actualizar la contraseña' });
        return res.status(204).send();
    }
    async findByCi(req, res) {
        const ci = req.params.ci;
        if (!ci) {
            return res.status(400).json({ message: 'CI inválido' });
        }
        try {
            const user = await UserServiceContainer_1.UserServiceContainer.user.findByCi.run(ci);
            return res.status(200).json(user);
        }
        catch (error) {
            return res.json().status(404);
        }
    }
    async findById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        try {
            const user = await UserServiceContainer_1.UserServiceContainer.user.findById.run(id);
            return res.json(user).status(200);
        }
        catch (error) {
            return res.json().status(404);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map