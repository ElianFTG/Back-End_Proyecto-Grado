import { Router } from "express";
import { UserController } from "./UserController";

const controller = new UserController();

const UserRouter = Router();

UserRouter.get("/users", controller.getUsers);
UserRouter.post("/users", controller.create);
UserRouter.patch("/users/:id", controller.update);

export {UserRouter};