import { Router } from "express";
import { UserController } from "./UserController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const controller = new UserController();
const authService = AuthServiceContainer.authService();
 

const UserRouter = Router();

UserRouter.get("/users", authJwt(authService),requireRole("administrador", "super administrador"),controller.getUsers);
UserRouter.get("/users/ci/:ci", controller.findByCi);
UserRouter.get("/users/:id", controller.findById);
UserRouter.post("/users", controller.create);
UserRouter.patch("/users/:id", controller.update);
UserRouter.patch("/users/:id/state", controller.updateState);

export {UserRouter};