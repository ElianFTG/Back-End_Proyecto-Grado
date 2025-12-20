import { Router } from "express";
import { UserController } from "./UserController";

const controller = new UserController();

const UserRouter = Router();

UserRouter.get("/users", controller.getUsers);
UserRouter.get("/users/ci/:ci", controller.findByCi);
UserRouter.get("/users/:id", controller.findById);
UserRouter.post("/users", controller.create);
UserRouter.patch("/users/:id", controller.update);
UserRouter.patch("/users/:id/state", controller.updateState);

export {UserRouter};